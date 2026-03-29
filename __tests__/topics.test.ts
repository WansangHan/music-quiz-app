import { TOPICS, getTopicsByCategory, getTopicById } from '../src/data/topics';
import { TopicCategory } from '../src/constants/topicCategory';
import { getChordTones, getScaleTones, CHORD_TYPES, SCALE_TYPES, NATURAL_ROOTS } from '../src/lib/musicTheory';

describe('TOPICS data', () => {
  it('generates a reasonable number of topics (300-600)', () => {
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
      expect(typeof t.sortOrder).toBe('number');
    }
  });

  it('all IDs are unique', () => {
    const ids = TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has all 6 categories', () => {
    const categories = new Set(TOPICS.map((t) => t.category));
    expect(categories.size).toBe(6);
    for (const cat of Object.values(TopicCategory)) {
      expect(categories.has(cat)).toBe(true);
    }
  });
});

describe('category counts', () => {
  it('Interval: 11 intervals * 7 roots = 77', () => {
    // 13 intervals minus 완전1도(0) and 완전8도(12) = 11, * 7 roots
    const intervals = getTopicsByCategory(TopicCategory.Interval);
    expect(intervals.length).toBe(11 * 7);
  });

  it('Chord: 7 types * 7 roots = 49', () => {
    const chords = getTopicsByCategory(TopicCategory.Chord);
    expect(chords.length).toBe(CHORD_TYPES.length * NATURAL_ROOTS.length);
  });

  it('Scale: 2 types * 7 roots = 14', () => {
    const scales = getTopicsByCategory(TopicCategory.Scale);
    expect(scales.length).toBe(SCALE_TYPES.length * NATURAL_ROOTS.length);
  });

  it('ChordTone: sum of (toneCount * 7 roots) for each chord type', () => {
    const topics = getTopicsByCategory(TopicCategory.ChordTone);
    const expected = CHORD_TYPES.reduce(
      (sum, c) => sum + c.formula.length * NATURAL_ROOTS.length,
      0,
    );
    expect(topics.length).toBe(expected);
  });

  it('ScaleTone: 2 types * 7 roots * 7 degrees = 98', () => {
    const topics = getTopicsByCategory(TopicCategory.ScaleTone);
    expect(topics.length).toBe(SCALE_TYPES.length * NATURAL_ROOTS.length * 7);
  });

  it('NoteName: 7 solfege→note + 7 note→solfege + 10 enharmonics = 24', () => {
    const topics = getTopicsByCategory(TopicCategory.NoteName);
    expect(topics.length).toBe(24);
  });
});

describe('correctAnswer validity', () => {
  it('Interval correctAnswers are valid interval names', () => {
    const intervalNames = new Set(
      getTopicsByCategory(TopicCategory.Interval).map((t) => t.correctAnswer),
    );
    // All answers should be among the known interval names
    for (const name of intervalNames) {
      expect(name).toMatch(/(도|음)$/);
    }
  });

  it('Chord correctAnswers match root + Korean type', () => {
    for (const t of getTopicsByCategory(TopicCategory.Chord)) {
      expect(t.correctAnswer).toMatch(/^[A-G][#b]? /);
    }
  });

  it('ChordTone correctAnswers are valid note names', () => {
    for (const t of getTopicsByCategory(TopicCategory.ChordTone)) {
      expect(t.correctAnswer).toMatch(/^[A-G][#b]?$/);
    }
  });

  it('ChordTone answers are actually in the chord', () => {
    for (const t of getTopicsByCategory(TopicCategory.ChordTone)) {
      // Extract root and type from the question
      const match = t.id.match(/^chordtone_([A-G])_(\w+)_(\d)$/);
      if (!match) continue;
      const [, root, type] = match;
      const tones = getChordTones(root, type);
      expect(tones).toContain(t.correctAnswer);
    }
  });

  it('ScaleTone answers are actually in the scale', () => {
    for (const t of getTopicsByCategory(TopicCategory.ScaleTone)) {
      const match = t.id.match(/^scaletone_([A-G])_(\w+)_(\d)$/);
      if (!match) continue;
      const [, root, type] = match;
      const tones = getScaleTones(root, type);
      expect(tones).toContain(t.correctAnswer);
    }
  });
});

describe('getTopicsByCategory', () => {
  it('returns only matching topics', () => {
    for (const cat of Object.values(TopicCategory)) {
      const topics = getTopicsByCategory(cat);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.every((t) => t.category === cat)).toBe(true);
    }
  });
});

describe('getTopicById', () => {
  it('finds first topic', () => {
    const first = TOPICS[0];
    expect(getTopicById(first.id)).toEqual(first);
  });

  it('finds last topic', () => {
    const last = TOPICS[TOPICS.length - 1];
    expect(getTopicById(last.id)).toEqual(last);
  });

  it('returns undefined for nonexistent ID', () => {
    expect(getTopicById('does_not_exist')).toBeUndefined();
  });
});
