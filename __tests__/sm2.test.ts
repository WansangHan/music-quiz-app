import { calculateNextReview } from '../src/lib/sm2';
import { MasteryLevel } from '../src/constants/masteryLevel';

describe('calculateNextReview', () => {
  const now = new Date('2026-01-01T12:00:00Z');

  it('demotes level on wrong answer', () => {
    const result = calculateNextReview({
      isCorrect: false,
      currentLevel: MasteryLevel.Familiar,
      currentStreak: 5,
      currentInterval: 7,
    }, now);

    expect(result.nextLevel).toBe(MasteryLevel.Learning);
    expect(result.nextStreak).toBe(0);
    expect(result.nextInterval).toBe(0.5);
  });

  it('does not go below level 0', () => {
    const result = calculateNextReview({
      isCorrect: false,
      currentLevel: MasteryLevel.New,
      currentStreak: 0,
      currentInterval: 0,
    }, now);

    expect(result.nextLevel).toBe(MasteryLevel.New);
  });

  it('promotes when streak reaches threshold', () => {
    const result = calculateNextReview({
      isCorrect: true,
      currentLevel: MasteryLevel.New,
      currentStreak: 2, // will become 3, threshold for level 0
      currentInterval: 0,
    }, now);

    expect(result.nextLevel).toBe(MasteryLevel.Learning);
    expect(result.nextStreak).toBe(3);
  });

  it('increments streak on correct answer', () => {
    const result = calculateNextReview({
      isCorrect: true,
      currentLevel: MasteryLevel.Learning,
      currentStreak: 1,
      currentInterval: 0.5,
    }, now);

    expect(result.nextStreak).toBe(2);
  });

  it('returns a future review date', () => {
    const result = calculateNextReview({
      isCorrect: true,
      currentLevel: MasteryLevel.Proficient,
      currentStreak: 2,
      currentInterval: 14,
    }, now);

    expect(result.nextReviewAt.getTime()).toBeGreaterThan(now.getTime());
  });
});
