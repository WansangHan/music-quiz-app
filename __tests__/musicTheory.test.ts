import {
  noteIndex,
  noteName,
  transpose,
  getEnharmonic,
  getAllNoteNames,
  getSolfege,
  getChordTones,
  getChordLabel,
  getScaleTones,
  getScaleLabel,
  solfegeToNote,
  noteToSolfege,
  getIntervalName,
  getIntervalSemitones,
  getToneLabel,
  getDegreeName,
  INTERVALS,
  CHORD_TYPES,
  SCALE_TYPES,
  NATURAL_ROOTS,
  CHROMATIC_ROOTS,
} from '../src/lib/musicTheory';

// --- noteIndex ---

describe('noteIndex', () => {
  it('returns correct index for all natural notes', () => {
    expect(noteIndex('C')).toBe(0);
    expect(noteIndex('D')).toBe(2);
    expect(noteIndex('E')).toBe(4);
    expect(noteIndex('F')).toBe(5);
    expect(noteIndex('G')).toBe(7);
    expect(noteIndex('A')).toBe(9);
    expect(noteIndex('B')).toBe(11);
  });

  it('returns correct index for sharps', () => {
    expect(noteIndex('C#')).toBe(1);
    expect(noteIndex('D#')).toBe(3);
    expect(noteIndex('F#')).toBe(6);
    expect(noteIndex('G#')).toBe(8);
    expect(noteIndex('A#')).toBe(10);
  });

  it('returns correct index for flats', () => {
    expect(noteIndex('Db')).toBe(1);
    expect(noteIndex('Eb')).toBe(3);
    expect(noteIndex('Gb')).toBe(6);
    expect(noteIndex('Ab')).toBe(8);
    expect(noteIndex('Bb')).toBe(10);
  });

  it('handles enharmonic edge cases', () => {
    expect(noteIndex('E#')).toBe(5);  // E# = F
    expect(noteIndex('Fb')).toBe(4);  // Fb = E
    expect(noteIndex('B#')).toBe(0);  // B# = C
    expect(noteIndex('Cb')).toBe(11); // Cb = B
  });

  it('returns 0 for unknown note names', () => {
    expect(noteIndex('X')).toBe(0);
    expect(noteIndex('')).toBe(0);
  });
});

// --- noteName ---

describe('noteName', () => {
  it('returns correct note for indices 0-11', () => {
    expect(noteName(0)).toBe('C');
    expect(noteName(1)).toBe('C#');
    expect(noteName(4)).toBe('E');
    expect(noteName(7)).toBe('G');
    expect(noteName(11)).toBe('B');
  });

  it('wraps indices beyond 11', () => {
    expect(noteName(12)).toBe('C');
    expect(noteName(13)).toBe('C#');
    expect(noteName(24)).toBe('C');
  });

  it('handles negative indices', () => {
    expect(noteName(-1)).toBe('B');
    expect(noteName(-12)).toBe('C');
  });
});

// --- transpose ---

describe('transpose', () => {
  it('transposes up by various intervals', () => {
    expect(transpose('C', 0)).toBe('C');
    expect(transpose('C', 1)).toBe('C#');
    expect(transpose('C', 4)).toBe('E');
    expect(transpose('C', 7)).toBe('G');
    expect(transpose('C', 12)).toBe('C');
  });

  it('wraps around octave boundary', () => {
    expect(transpose('A', 4)).toBe('C#');
    expect(transpose('B', 1)).toBe('C');
    expect(transpose('G', 7)).toBe('D');
  });

  it('works from sharp/flat roots', () => {
    expect(transpose('F#', 7)).toBe('C#');
    expect(transpose('Bb', 3)).toBe('C#');
  });
});

// --- getEnharmonic ---

describe('getEnharmonic', () => {
  it('returns enharmonic for all sharp/flat pairs', () => {
    expect(getEnharmonic('C#')).toBe('Db');
    expect(getEnharmonic('Db')).toBe('C#');
    expect(getEnharmonic('D#')).toBe('Eb');
    expect(getEnharmonic('Eb')).toBe('D#');
    expect(getEnharmonic('F#')).toBe('Gb');
    expect(getEnharmonic('Gb')).toBe('F#');
    expect(getEnharmonic('G#')).toBe('Ab');
    expect(getEnharmonic('Ab')).toBe('G#');
    expect(getEnharmonic('A#')).toBe('Bb');
    expect(getEnharmonic('Bb')).toBe('A#');
  });

  it('returns null for natural notes', () => {
    for (const n of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      expect(getEnharmonic(n)).toBeNull();
    }
  });
});

// --- getAllNoteNames / getSolfege ---

describe('getAllNoteNames', () => {
  it('returns 12 chromatic note names', () => {
    const names = getAllNoteNames();
    expect(names).toHaveLength(12);
    expect(names[0]).toBe('C');
    expect(names[11]).toBe('B');
  });

  it('returns a copy (not original array)', () => {
    const a = getAllNoteNames();
    const b = getAllNoteNames();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe('getSolfege', () => {
  it('returns 7 solfege names', () => {
    const s = getSolfege();
    expect(s).toHaveLength(7);
    expect(s).toEqual(['도', '레', '미', '파', '솔', '라', '시']);
  });
});

// --- solfegeToNote / noteToSolfege ---

describe('solfegeToNote', () => {
  it('converts all 7 solfege to correct notes', () => {
    expect(solfegeToNote('도')).toBe('C');
    expect(solfegeToNote('레')).toBe('D');
    expect(solfegeToNote('미')).toBe('E');
    expect(solfegeToNote('파')).toBe('F');
    expect(solfegeToNote('솔')).toBe('G');
    expect(solfegeToNote('라')).toBe('A');
    expect(solfegeToNote('시')).toBe('B');
  });

  it('returns C for unknown solfege', () => {
    expect(solfegeToNote('unknown')).toBe('C');
  });
});

describe('noteToSolfege', () => {
  it('converts all natural notes to solfege', () => {
    expect(noteToSolfege('C')).toBe('도');
    expect(noteToSolfege('D')).toBe('레');
    expect(noteToSolfege('E')).toBe('미');
    expect(noteToSolfege('F')).toBe('파');
    expect(noteToSolfege('G')).toBe('솔');
    expect(noteToSolfege('A')).toBe('라');
    expect(noteToSolfege('B')).toBe('시');
  });

  it('returns empty string for chromatic (non-natural) notes', () => {
    expect(noteToSolfege('C#')).toBe('');
    expect(noteToSolfege('Eb')).toBe('');
    expect(noteToSolfege('F#')).toBe('');
    expect(noteToSolfege('Bb')).toBe('');
  });
});

// --- getIntervalName / getIntervalSemitones ---

describe('getIntervalName', () => {
  it('returns Korean name for known semitone counts', () => {
    expect(getIntervalName(0)).toBe('완전1도');
    expect(getIntervalName(4)).toBe('장3도');
    expect(getIntervalName(7)).toBe('완전5도');
    expect(getIntervalName(12)).toBe('완전8도');
  });

  it('returns fallback for unknown semitone counts', () => {
    expect(getIntervalName(13)).toBe('13반음');
    expect(getIntervalName(99)).toBe('99반음');
  });
});

describe('getIntervalSemitones', () => {
  it('returns semitone count for known interval names', () => {
    expect(getIntervalSemitones('장3도')).toBe(4);
    expect(getIntervalSemitones('완전5도')).toBe(7);
    expect(getIntervalSemitones('삼전음')).toBe(6);
  });

  it('returns 0 for unknown interval names', () => {
    expect(getIntervalSemitones('없는음정')).toBe(0);
  });
});

// --- getChordTones / getChordLabel ---

describe('getChordTones', () => {
  it('returns correct Major triad', () => {
    expect(getChordTones('C', 'Major')).toEqual(['C', 'E', 'G']);
  });

  it('returns correct Minor triad', () => {
    expect(getChordTones('A', 'Minor')).toEqual(['A', 'C', 'E']);
  });

  it('returns correct Diminished triad', () => {
    expect(getChordTones('B', 'Diminished')).toEqual(['B', 'D', 'F']);
  });

  it('returns correct Augmented triad', () => {
    expect(getChordTones('C', 'Augmented')).toEqual(['C', 'E', 'G#']);
  });

  it('returns correct Dominant7', () => {
    expect(getChordTones('G', 'Dominant7')).toEqual(['G', 'B', 'D', 'F']);
  });

  it('returns correct Major7', () => {
    expect(getChordTones('C', 'Major7')).toEqual(['C', 'E', 'G', 'B']);
  });

  it('returns correct Minor7', () => {
    expect(getChordTones('D', 'Minor7')).toEqual(['D', 'F', 'A', 'C']);
  });

  it('returns [root] for unknown chord type', () => {
    expect(getChordTones('C', 'UnknownChord')).toEqual(['C']);
  });
});

describe('getChordLabel', () => {
  it('returns Korean label for known types', () => {
    expect(getChordLabel('C', 'Major')).toBe('C 메이저');
    expect(getChordLabel('A', 'Minor')).toBe('A 마이너');
    expect(getChordLabel('G', 'Dominant7')).toBe('G 도미넌트 7');
  });

  it('uses raw type name as fallback for unknown types', () => {
    expect(getChordLabel('C', 'UnknownChord')).toBe('C UnknownChord');
  });
});

// --- getScaleTones / getScaleLabel ---

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

  it('returns correct D Major scale', () => {
    expect(getScaleTones('D', 'Major')).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C#']);
  });

  it('returns correct E Natural Minor scale', () => {
    expect(getScaleTones('E', 'NaturalMinor')).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D']);
  });

  it('returns [root] for unknown scale type', () => {
    expect(getScaleTones('C', 'UnknownScale')).toEqual(['C']);
  });
});

describe('getScaleLabel', () => {
  it('returns Korean label for known types', () => {
    expect(getScaleLabel('C', 'Major')).toBe('C 메이저');
    expect(getScaleLabel('A', 'NaturalMinor')).toBe('A 내추럴 마이너');
  });

  it('uses raw type name as fallback for unknown types', () => {
    expect(getScaleLabel('C', 'Harmonic')).toBe('C Harmonic');
  });
});

// --- getToneLabel / getDegreeName ---

describe('getToneLabel', () => {
  it('labels triad tones correctly (total <= 3)', () => {
    expect(getToneLabel(0, 3)).toBe('근음');
    expect(getToneLabel(1, 3)).toBe('3음');
    expect(getToneLabel(2, 3)).toBe('5음');
  });

  it('labels 7th chord tones correctly (total > 3)', () => {
    expect(getToneLabel(0, 4)).toBe('근음');
    expect(getToneLabel(1, 4)).toBe('3음');
    expect(getToneLabel(2, 4)).toBe('5음');
    expect(getToneLabel(3, 4)).toBe('7음');
  });

  it('falls back to numbered label for out-of-range index', () => {
    expect(getToneLabel(3, 3)).toBe('4음');
    expect(getToneLabel(4, 4)).toBe('5음');
    expect(getToneLabel(5, 5)).toBe('6음');
  });
});

describe('getDegreeName', () => {
  it('returns degree name', () => {
    expect(getDegreeName(1)).toBe('1음');
    expect(getDegreeName(5)).toBe('5음');
    expect(getDegreeName(7)).toBe('7음');
  });
});

// --- constants ---

describe('data constants', () => {
  it('INTERVALS has 13 entries', () => {
    expect(INTERVALS).toHaveLength(13);
  });

  it('INTERVALS semitones are 0-12 inclusive', () => {
    const semitones = INTERVALS.map((i) => i.semitones);
    expect(semitones).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('CHORD_TYPES has 7 entries', () => {
    expect(CHORD_TYPES).toHaveLength(7);
  });

  it('SCALE_TYPES has 2 entries', () => {
    expect(SCALE_TYPES).toHaveLength(2);
  });

  it('NATURAL_ROOTS has 7 notes', () => {
    expect(NATURAL_ROOTS).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  it('CHROMATIC_ROOTS has 12 notes', () => {
    expect(CHROMATIC_ROOTS).toHaveLength(12);
  });
});

// --- music theory correctness (cross-checks) ---

describe('music theory correctness', () => {
  it('all Major triads have correct intervals: root + M3 + P5', () => {
    for (const root of NATURAL_ROOTS) {
      const tones = getChordTones(root, 'Major');
      expect(tones).toHaveLength(3);
      const rootIdx = noteIndex(root);
      expect((noteIndex(tones[1]) - rootIdx + 12) % 12).toBe(4); // M3
      expect((noteIndex(tones[2]) - rootIdx + 12) % 12).toBe(7); // P5
    }
  });

  it('all Minor triads have correct intervals: root + m3 + P5', () => {
    for (const root of NATURAL_ROOTS) {
      const tones = getChordTones(root, 'Minor');
      const rootIdx = noteIndex(root);
      expect((noteIndex(tones[1]) - rootIdx + 12) % 12).toBe(3); // m3
      expect((noteIndex(tones[2]) - rootIdx + 12) % 12).toBe(7); // P5
    }
  });

  it('Major scales follow whole-whole-half-whole-whole-whole-half pattern', () => {
    const pattern = [2, 2, 1, 2, 2, 2, 1]; // W-W-H-W-W-W-H
    for (const root of NATURAL_ROOTS) {
      const tones = getScaleTones(root, 'Major');
      for (let i = 0; i < 7; i++) {
        const curr = noteIndex(tones[i]);
        const next = noteIndex(tones[(i + 1) % 7]);
        expect((next - curr + 12) % 12).toBe(pattern[i]);
      }
    }
  });

  it('Natural Minor scales follow whole-half-whole-whole-half-whole-whole pattern', () => {
    const pattern = [2, 1, 2, 2, 1, 2, 2]; // W-H-W-W-H-W-W
    for (const root of NATURAL_ROOTS) {
      const tones = getScaleTones(root, 'NaturalMinor');
      for (let i = 0; i < 7; i++) {
        const curr = noteIndex(tones[i]);
        const next = noteIndex(tones[(i + 1) % 7]);
        expect((next - curr + 12) % 12).toBe(pattern[i]);
      }
    }
  });

  it('solfege <-> note roundtrip for all natural notes', () => {
    for (const note of NATURAL_ROOTS) {
      const sf = noteToSolfege(note);
      expect(sf).not.toBe('');
      expect(solfegeToNote(sf)).toBe(note);
    }
  });

  it('getIntervalName and getIntervalSemitones are inverse', () => {
    for (const interval of INTERVALS) {
      expect(getIntervalName(interval.semitones)).toBe(interval.name);
      expect(getIntervalSemitones(interval.name)).toBe(interval.semitones);
    }
  });
});
