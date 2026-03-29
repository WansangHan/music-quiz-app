import { calculateNextReview } from '../src/lib/sm2';
import { MasteryLevel } from '../src/constants/masteryLevel';
import {
  MASTERY_INTERVALS,
  PROMOTION_THRESHOLDS,
  WRONG_ANSWER_INTERVAL,
} from '../src/constants/quiz';

describe('calculateNextReview', () => {
  const now = new Date('2026-01-01T12:00:00Z');

  // --- wrong answers ---

  describe('wrong answers', () => {
    it('demotes level by 1', () => {
      const result = calculateNextReview({
        isCorrect: false,
        currentLevel: MasteryLevel.Familiar,
        currentStreak: 5,
        currentInterval: 7,
      }, now);

      expect(result.nextLevel).toBe(MasteryLevel.Learning);
      expect(result.nextStreak).toBe(0);
      expect(result.nextInterval).toBe(WRONG_ANSWER_INTERVAL);
    });

    it('does not go below level 0', () => {
      const result = calculateNextReview({
        isCorrect: false,
        currentLevel: MasteryLevel.New,
        currentStreak: 0,
        currentInterval: 0,
      }, now);

      expect(result.nextLevel).toBe(MasteryLevel.New);
      expect(result.nextStreak).toBe(0);
    });

    it('demotes from Mastered to Proficient', () => {
      const result = calculateNextReview({
        isCorrect: false,
        currentLevel: MasteryLevel.Mastered,
        currentStreak: 10,
        currentInterval: 60,
      }, now);

      expect(result.nextLevel).toBe(MasteryLevel.Proficient);
    });

    it('schedules review 12 hours later', () => {
      const result = calculateNextReview({
        isCorrect: false,
        currentLevel: MasteryLevel.Learning,
        currentStreak: 3,
        currentInterval: 1,
      }, now);

      const expectedMs = WRONG_ANSWER_INTERVAL * 24 * 60 * 60 * 1000;
      expect(result.nextReviewAt.getTime()).toBe(now.getTime() + expectedMs);
    });
  });

  // --- correct answers, no promotion ---

  describe('correct answers without promotion', () => {
    it('increments streak', () => {
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.Learning,
        currentStreak: 1,
        currentInterval: 0.5,
      }, now);

      expect(result.nextStreak).toBe(2);
      expect(result.nextLevel).toBe(MasteryLevel.Learning);
    });

    it('stays at same level when streak below threshold', () => {
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.Familiar,
        currentStreak: 3, // threshold for level 2 is 7
        currentInterval: 3,
      }, now);

      expect(result.nextLevel).toBe(MasteryLevel.Familiar);
      expect(result.nextStreak).toBe(4);
    });
  });

  // --- promotions ---

  describe('promotions', () => {
    it('promotes New → Learning at streak 3', () => {
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.New,
        currentStreak: 2,
        currentInterval: 0,
      }, now);

      expect(result.nextLevel).toBe(MasteryLevel.Learning);
      expect(result.nextStreak).toBe(3);
    });

    it('promotes Learning → Familiar at streak 5', () => {
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.Learning,
        currentStreak: 4,
        currentInterval: 1,
      }, now);

      expect(result.nextLevel).toBe(MasteryLevel.Familiar);
      expect(result.nextStreak).toBe(5);
    });

    it('promotes Familiar → Proficient at streak 7', () => {
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.Familiar,
        currentStreak: 6,
        currentInterval: 7,
      }, now);

      expect(result.nextLevel).toBe(MasteryLevel.Proficient);
    });

    it('promotes Proficient → Mastered at streak 9', () => {
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.Proficient,
        currentStreak: 8,
        currentInterval: 14,
      }, now);

      expect(result.nextLevel).toBe(MasteryLevel.Mastered);
    });

    it('stays at Mastered even with high streak', () => {
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.Mastered,
        currentStreak: 20,
        currentInterval: 120,
      }, now);

      expect(result.nextLevel).toBe(MasteryLevel.Mastered);
    });
  });

  // --- interval calculation ---

  describe('interval calculation', () => {
    it('uses correct base interval from MASTERY_INTERVALS', () => {
      // First correct at level 0: successIndex = min(1-1,2) = 0
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.New,
        currentStreak: 0,
        currentInterval: 0,
      }, now);

      // Level 0, successIndex 0 → base 0, bonus 1.1 → 0
      expect(result.nextInterval).toBe(0);
    });

    it('applies bonus factor that caps at 2.0', () => {
      // streak=20 → bonusFactor = min(1.0 + 20*0.1, 2.0) = 2.0
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.Mastered,
        currentStreak: 19,
        currentInterval: 60,
      }, now);

      // successIndex = min(19, 2) = 2, level 4 → base 120
      // bonus = min(1 + 20*0.1, 2.0) = 2.0
      // interval = 120 * 2.0 = 240
      expect(result.nextInterval).toBe(240);
    });

    it('returns a review date in the future for non-zero intervals', () => {
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.Proficient,
        currentStreak: 2,
        currentInterval: 14,
      }, now);

      expect(result.nextReviewAt.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  // --- default now parameter ---

  describe('default parameter', () => {
    it('uses current time when now is not provided', () => {
      const before = Date.now();
      const result = calculateNextReview({
        isCorrect: true,
        currentLevel: MasteryLevel.Learning,
        currentStreak: 1,
        currentInterval: 0.5,
      });
      const after = Date.now();

      expect(result.nextReviewAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.nextReviewAt.getTime()).toBeLessThanOrEqual(after + 3 * 24 * 60 * 60 * 1000 + 1000);
    });
  });
});
