import {
  noteIndex,
  noteName,
  transpose,
  getEnharmonic,
  getChordTones,
  getScaleTones,
  solfegeToNote,
  noteToSolfege,
  INTERVALS,
  CHORD_TYPES,
  SCALE_TYPES,
} from '../src/lib/musicTheory';

describe('noteIndex', () => {
  it('returns correct index for natural notes', () => {
    expect(noteIndex('C')).toBe(0);
    expect(noteIndex('D')).toBe(2);
    expect(noteIndex('E')).toBe(4);
    expect(noteIndex('F')).toBe(5);
    expect(noteIndex('G')).toBe(7);
    expect(noteIndex('A')).toBe(9);
    expect(noteIndex('B')).toBe(11);
  });

  it('returns correct index for sharps and flats', () => {
    expect(noteIndex('C#')).toBe(1);
    expect(noteIndex('Db')).toBe(1);
    expect(noteIndex('F#')).toBe(6);
    expect(noteIndex('Gb')).toBe(6);
  });
});

describe('transpose', () => {
  it('transposes up correctly', () => {
    expect(transpose('C', 4)).toBe('E');
    expect(transpose('C', 7)).toBe('G');
    expect(transpose('G', 7)).toBe('D');
  });

  it('wraps around octave', () => {
    expect(transpose('A', 4)).toBe('C#');
    expect(transpose('B', 1)).toBe('C');
  });
});

describe('getEnharmonic', () => {
  it('returns enharmonic equivalent', () => {
    expect(getEnharmonic('C#')).toBe('Db');
    expect(getEnharmonic('Db')).toBe('C#');
    expect(getEnharmonic('Bb')).toBe('A#');
  });

  it('returns null for natural notes', () => {
    expect(getEnharmonic('C')).toBeNull();
    expect(getEnharmonic('D')).toBeNull();
  });
});

describe('getChordTones', () => {
  it('returns correct Major triad', () => {
    expect(getChordTones('C', 'Major')).toEqual(['C', 'E', 'G']);
  });

  it('returns correct Minor triad', () => {
    expect(getChordTones('A', 'Minor')).toEqual(['A', 'C', 'E']);
  });

  it('returns correct Dominant7', () => {
    expect(getChordTones('G', 'Dominant7')).toEqual(['G', 'B', 'D', 'F']);
  });

  it('returns correct Diminished', () => {
    expect(getChordTones('B', 'Diminished')).toEqual(['B', 'D', 'F']);
  });
});

describe('getScaleTones', () => {
  it('returns correct C Major scale', () => {
    expect(getScaleTones('C', 'Major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  it('returns correct A Natural Minor scale', () => {
    expect(getScaleTones('A', 'NaturalMinor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });

  it('returns correct G Major scale', () => {
    expect(getScaleTones('G', 'Major')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
  });
});

describe('solfege conversion', () => {
  it('converts solfege to note', () => {
    expect(solfegeToNote('도')).toBe('C');
    expect(solfegeToNote('레')).toBe('D');
    expect(solfegeToNote('솔')).toBe('G');
  });

  it('converts note to solfege', () => {
    expect(noteToSolfege('C')).toBe('도');
    expect(noteToSolfege('G')).toBe('솔');
    expect(noteToSolfege('B')).toBe('시');
  });
});

describe('data integrity', () => {
  it('has 13 intervals', () => {
    expect(INTERVALS.length).toBe(13);
  });

  it('has 7 chord types', () => {
    expect(CHORD_TYPES.length).toBe(7);
  });

  it('has 2 scale types', () => {
    expect(SCALE_TYPES.length).toBe(2);
  });
});
