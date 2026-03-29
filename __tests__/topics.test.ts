import { TOPICS, getTopicsByCategory, getTopicById } from '../src/data/topics';
import { TopicCategory } from '../src/constants/topicCategory';

describe('TOPICS data', () => {
  it('generates a reasonable number of topics', () => {
    expect(TOPICS.length).toBeGreaterThan(300);
    expect(TOPICS.length).toBeLessThan(600);
  });

  it('all topics have required fields', () => {
    for (const t of TOPICS) {
      expect(t.id).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(t.displayName).toBeTruthy();
      expect(t.question).toBeTruthy();
      expect(t.correctAnswer).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect([1, 2, 3]).toContain(t.difficulty);
    }
  });

  it('has unique IDs', () => {
    const ids = TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has all 6 categories', () => {
    const categories = new Set(TOPICS.map((t) => t.category));
    expect(categories.size).toBe(6);
    expect(categories.has(TopicCategory.Interval)).toBe(true);
    expect(categories.has(TopicCategory.Chord)).toBe(true);
    expect(categories.has(TopicCategory.Scale)).toBe(true);
    expect(categories.has(TopicCategory.ChordTone)).toBe(true);
    expect(categories.has(TopicCategory.ScaleTone)).toBe(true);
    expect(categories.has(TopicCategory.NoteName)).toBe(true);
  });
});

describe('getTopicsByCategory', () => {
  it('returns only interval topics for Interval category', () => {
    const intervals = getTopicsByCategory(TopicCategory.Interval);
    expect(intervals.length).toBeGreaterThan(0);
    expect(intervals.every((t) => t.category === TopicCategory.Interval)).toBe(true);
  });
});

describe('getTopicById', () => {
  it('finds a topic by ID', () => {
    const first = TOPICS[0];
    expect(getTopicById(first.id)).toEqual(first);
  });

  it('returns undefined for unknown ID', () => {
    expect(getTopicById('nonexistent')).toBeUndefined();
  });
});
