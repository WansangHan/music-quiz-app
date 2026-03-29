import {
  noteIndex,
  noteName,
  transpose,
  transposeByInterval,
  getEnharmonic,
  getAllNoteNames,
  getAllNoteNamesExtended,
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
  assignOctaves,
  P1, m2, M2, m3, M3, P4, A4, d5, P5, A5, m6, M6, m7, M7, P8,
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

// --- getChordLabel ---

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

// --- getScaleLabel ---

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

// --- assignOctaves ---

describe('assignOctaves', () => {
  it('C Major stays in octave 4 (root=C, all higher)', () => {
    expect(assignOctaves(['C', 'E', 'G'])).toEqual(['C4', 'E4', 'G4']);
  });

  it('A Major wraps C# and E to octave 5', () => {
    expect(assignOctaves(['A', 'C#', 'E'])).toEqual(['A4', 'C#5', 'E5']);
  });

  it('G Major wraps only notes below G to octave 5', () => {
    expect(assignOctaves(['G', 'B', 'D'])).toEqual(['G4', 'B4', 'D5']);
  });

  it('F Major wraps C to octave 5', () => {
    expect(assignOctaves(['F', 'A', 'C'])).toEqual(['F4', 'A4', 'C5']);
  });

  it('B Diminished wraps D and F to octave 5', () => {
    expect(assignOctaves(['B', 'D', 'F'])).toEqual(['B4', 'D5', 'F5']);
  });

  it('respects custom base octave', () => {
    expect(assignOctaves(['A', 'C#', 'E'], 3)).toEqual(['A3', 'C#4', 'E4']);
  });

  it('scale: G Major ascending', () => {
    expect(assignOctaves(['G', 'A', 'B', 'C', 'D', 'E', 'F#']))
      .toEqual(['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5']);
  });

  it('empty input returns empty', () => {
    expect(assignOctaves([])).toEqual([]);
  });

  it('single note stays at base octave', () => {
    expect(assignOctaves(['A'])).toEqual(['A4']);
  });

  it('handles flats (Eb, Ab, Bb)', () => {
    expect(assignOctaves(['C', 'Eb', 'G'])).toEqual(['C4', 'Eb4', 'G4']);
    expect(assignOctaves(['F', 'Ab', 'C'])).toEqual(['F4', 'Ab4', 'C5']);
  });
});

// --- transposeByInterval (핵심: 이명동음 철자 검증) ---

describe('transposeByInterval', () => {
  describe('완전 음정 (Perfect)', () => {
    it('P1: 동음', () => {
      expect(transposeByInterval('C', P1)).toBe('C');
      expect(transposeByInterval('F#', P1)).toBe('F#');
    });

    it('P4: 완전4도', () => {
      expect(transposeByInterval('C', P4)).toBe('F');
      expect(transposeByInterval('G', P4)).toBe('C');
      expect(transposeByInterval('D', P4)).toBe('G');
      expect(transposeByInterval('F', P4)).toBe('Bb');
      expect(transposeByInterval('B', P4)).toBe('E');
    });

    it('P5: 완전5도', () => {
      expect(transposeByInterval('C', P5)).toBe('G');
      expect(transposeByInterval('D', P5)).toBe('A');
      expect(transposeByInterval('E', P5)).toBe('B');
      expect(transposeByInterval('F', P5)).toBe('C');
      expect(transposeByInterval('G', P5)).toBe('D');
      expect(transposeByInterval('A', P5)).toBe('E');
      expect(transposeByInterval('B', P5)).toBe('F#');
    });

    it('P8: 완전8도', () => {
      expect(transposeByInterval('C', P8)).toBe('C');
      expect(transposeByInterval('A', P8)).toBe('A');
    });
  });

  describe('장음정 (Major)', () => {
    it('M2: 장2도', () => {
      expect(transposeByInterval('C', M2)).toBe('D');
      expect(transposeByInterval('F', M2)).toBe('G');
      expect(transposeByInterval('B', M2)).toBe('C#');
      expect(transposeByInterval('A', M2)).toBe('B');
    });

    it('M3: 장3도', () => {
      expect(transposeByInterval('C', M3)).toBe('E');
      expect(transposeByInterval('D', M3)).toBe('F#');
      expect(transposeByInterval('F', M3)).toBe('A');
      expect(transposeByInterval('G', M3)).toBe('B');
      expect(transposeByInterval('A', M3)).toBe('C#');
      expect(transposeByInterval('B', M3)).toBe('D#');
    });

    it('M6: 장6도', () => {
      expect(transposeByInterval('C', M6)).toBe('A');
      expect(transposeByInterval('D', M6)).toBe('B');
      expect(transposeByInterval('G', M6)).toBe('E');
      expect(transposeByInterval('F', M6)).toBe('D');
    });

    it('M7: 장7도', () => {
      expect(transposeByInterval('C', M7)).toBe('B');
      expect(transposeByInterval('G', M7)).toBe('F#');
      expect(transposeByInterval('D', M7)).toBe('C#');
      expect(transposeByInterval('F', M7)).toBe('E');
      expect(transposeByInterval('A', M7)).toBe('G#');
    });
  });

  describe('단음정 (Minor) — 플랫 철자 핵심 검증', () => {
    it('m2: 단2도', () => {
      expect(transposeByInterval('C', m2)).toBe('Db');
      expect(transposeByInterval('E', m2)).toBe('F');
      expect(transposeByInterval('B', m2)).toBe('C');
    });

    it('m3: 단3도 — C+m3=Eb (not D#)', () => {
      expect(transposeByInterval('C', m3)).toBe('Eb');
      expect(transposeByInterval('A', m3)).toBe('C');
      expect(transposeByInterval('D', m3)).toBe('F');
      expect(transposeByInterval('E', m3)).toBe('G');
      expect(transposeByInterval('F', m3)).toBe('Ab');
      expect(transposeByInterval('G', m3)).toBe('Bb');
      expect(transposeByInterval('B', m3)).toBe('D');
    });

    it('m6: 단6도', () => {
      expect(transposeByInterval('C', m6)).toBe('Ab');
      expect(transposeByInterval('D', m6)).toBe('Bb');
      expect(transposeByInterval('E', m6)).toBe('C');
      expect(transposeByInterval('A', m6)).toBe('F');
    });

    it('m7: 단7도', () => {
      expect(transposeByInterval('C', m7)).toBe('Bb');
      expect(transposeByInterval('D', m7)).toBe('C');
      expect(transposeByInterval('G', m7)).toBe('F');
      expect(transposeByInterval('E', m7)).toBe('D');
    });
  });

  describe('증음정/감음정 (Augmented/Diminished)', () => {
    it('A4: 증4도', () => {
      expect(transposeByInterval('C', A4)).toBe('F#');
      expect(transposeByInterval('F', A4)).toBe('B');
    });

    it('d5: 감5도', () => {
      expect(transposeByInterval('C', d5)).toBe('Gb');
      expect(transposeByInterval('B', d5)).toBe('F');
      expect(transposeByInterval('E', d5)).toBe('Bb');
    });

    it('A5: 증5도', () => {
      expect(transposeByInterval('C', A5)).toBe('G#');
      expect(transposeByInterval('D', A5)).toBe('A#');
      expect(transposeByInterval('E', A5)).toBe('B#');
    });

    it('A5: 이중 임시표 정규화 (B+A5 → F## → G)', () => {
      expect(transposeByInterval('B', A5)).toBe('G');
    });
  });

  describe('같은 반음, 다른 다이아토닉 → 다른 철자', () => {
    it('C+m3(3반음,diatonic2)=Eb vs C+A2(3반음,diatonic1)=D#', () => {
      expect(transposeByInterval('C', { diatonic: 2, semitones: 3 })).toBe('Eb');
      expect(transposeByInterval('C', { diatonic: 1, semitones: 3 })).toBe('D#');
    });

    it('C+d5(6반음,diatonic4)=Gb vs C+A4(6반음,diatonic3)=F#', () => {
      expect(transposeByInterval('C', d5)).toBe('Gb');
      expect(transposeByInterval('C', A4)).toBe('F#');
    });
  });

  describe('유효하지 않은 루트', () => {
    it('returns root unchanged for invalid letter', () => {
      expect(transposeByInterval('X', M3)).toBe('X');
    });
  });

  describe('임시표가 있는 루트', () => {
    it('F# + m3 → A', () => {
      expect(transposeByInterval('F#', m3)).toBe('A');
    });

    it('Eb + P5 → Bb', () => {
      expect(transposeByInterval('Eb', P5)).toBe('Bb');
    });

    it('Bb + M3 → D', () => {
      expect(transposeByInterval('Bb', M3)).toBe('D');
    });
  });
});

// --- getChordTones: 7개 루트 × 7개 코드 타입 전수 검증 ---

describe('getChordTones — comprehensive', () => {
  describe('Major (P1, M3, P5)', () => {
    it.each([
      ['C', ['C', 'E', 'G']],
      ['D', ['D', 'F#', 'A']],
      ['E', ['E', 'G#', 'B']],
      ['F', ['F', 'A', 'C']],
      ['G', ['G', 'B', 'D']],
      ['A', ['A', 'C#', 'E']],
      ['B', ['B', 'D#', 'F#']],
    ])('%s Major', (root, expected) => {
      expect(getChordTones(root, 'Major')).toEqual(expected);
    });
  });

  describe('Minor (P1, m3, P5)', () => {
    it.each([
      ['C', ['C', 'Eb', 'G']],
      ['D', ['D', 'F', 'A']],
      ['E', ['E', 'G', 'B']],
      ['F', ['F', 'Ab', 'C']],
      ['G', ['G', 'Bb', 'D']],
      ['A', ['A', 'C', 'E']],
      ['B', ['B', 'D', 'F#']],
    ])('%s Minor', (root, expected) => {
      expect(getChordTones(root, 'Minor')).toEqual(expected);
    });
  });

  describe('Diminished (P1, m3, d5)', () => {
    it.each([
      ['C', ['C', 'Eb', 'Gb']],
      ['D', ['D', 'F', 'Ab']],
      ['E', ['E', 'G', 'Bb']],
      ['F', ['F', 'Ab', 'Cb']],
      ['G', ['G', 'Bb', 'Db']],
      ['A', ['A', 'C', 'Eb']],
      ['B', ['B', 'D', 'F']],
    ])('%s Diminished', (root, expected) => {
      expect(getChordTones(root, 'Diminished')).toEqual(expected);
    });
  });

  describe('Augmented (P1, M3, A5)', () => {
    it.each([
      ['C', ['C', 'E', 'G#']],
      ['D', ['D', 'F#', 'A#']],
      ['E', ['E', 'G#', 'B#']],
      ['F', ['F', 'A', 'C#']],
      ['G', ['G', 'B', 'D#']],
      ['A', ['A', 'C#', 'E#']],
      ['B', ['B', 'D#', 'G']],  // F## 정규화 → G
    ])('%s Augmented', (root, expected) => {
      expect(getChordTones(root, 'Augmented')).toEqual(expected);
    });
  });

  describe('Dominant7 (P1, M3, P5, m7)', () => {
    it.each([
      ['C', ['C', 'E', 'G', 'Bb']],
      ['D', ['D', 'F#', 'A', 'C']],
      ['G', ['G', 'B', 'D', 'F']],
      ['A', ['A', 'C#', 'E', 'G']],
      ['F', ['F', 'A', 'C', 'Eb']],
      ['E', ['E', 'G#', 'B', 'D']],
      ['B', ['B', 'D#', 'F#', 'A']],
    ])('%s Dominant7', (root, expected) => {
      expect(getChordTones(root, 'Dominant7')).toEqual(expected);
    });
  });

  describe('Major7 (P1, M3, P5, M7)', () => {
    it.each([
      ['C', ['C', 'E', 'G', 'B']],
      ['F', ['F', 'A', 'C', 'E']],
      ['G', ['G', 'B', 'D', 'F#']],
      ['D', ['D', 'F#', 'A', 'C#']],
    ])('%s Major7', (root, expected) => {
      expect(getChordTones(root, 'Major7')).toEqual(expected);
    });
  });

  describe('Minor7 (P1, m3, P5, m7)', () => {
    it.each([
      ['C', ['C', 'Eb', 'G', 'Bb']],
      ['D', ['D', 'F', 'A', 'C']],
      ['A', ['A', 'C', 'E', 'G']],
      ['E', ['E', 'G', 'B', 'D']],
    ])('%s Minor7', (root, expected) => {
      expect(getChordTones(root, 'Minor7')).toEqual(expected);
    });
  });

  it('returns [root] for unknown chord type', () => {
    expect(getChordTones('C', 'UnknownChord')).toEqual(['C']);
  });

  it('all chord types return correct number of tones', () => {
    for (const root of NATURAL_ROOTS) {
      for (const chord of CHORD_TYPES) {
        const tones = getChordTones(root, chord.type);
        expect(tones).toHaveLength(chord.formula.length);
      }
    }
  });
});

// --- getScaleTones: 7개 루트 × 2개 스케일 전수 검증 ---

describe('getScaleTones — comprehensive', () => {
  describe('Major', () => {
    it.each([
      ['C', ['C', 'D', 'E', 'F', 'G', 'A', 'B']],
      ['D', ['D', 'E', 'F#', 'G', 'A', 'B', 'C#']],
      ['E', ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#']],
      ['F', ['F', 'G', 'A', 'Bb', 'C', 'D', 'E']],
      ['G', ['G', 'A', 'B', 'C', 'D', 'E', 'F#']],
      ['A', ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#']],
      ['B', ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']],
    ])('%s Major', (root, expected) => {
      expect(getScaleTones(root, 'Major')).toEqual(expected);
    });
  });

  describe('Natural Minor', () => {
    it.each([
      ['C', ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb']],
      ['D', ['D', 'E', 'F', 'G', 'A', 'Bb', 'C']],
      ['E', ['E', 'F#', 'G', 'A', 'B', 'C', 'D']],
      ['F', ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb']],
      ['G', ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F']],
      ['A', ['A', 'B', 'C', 'D', 'E', 'F', 'G']],
      ['B', ['B', 'C#', 'D', 'E', 'F#', 'G', 'A']],
    ])('%s NaturalMinor', (root, expected) => {
      expect(getScaleTones(root, 'NaturalMinor')).toEqual(expected);
    });
  });

  it('returns [root] for unknown scale type', () => {
    expect(getScaleTones('C', 'UnknownScale')).toEqual(['C']);
  });

  it('all scales produce exactly 7 tones', () => {
    for (const root of NATURAL_ROOTS) {
      for (const scale of SCALE_TYPES) {
        expect(getScaleTones(root, scale.type)).toHaveLength(7);
      }
    }
  });

  it('C Major = 모두 자연음 (임시표 없음)', () => {
    const tones = getScaleTones('C', 'Major');
    for (const tone of tones) {
      expect(tone).toMatch(/^[A-G]$/);
    }
  });

  it('A NaturalMinor = 모두 자연음 (임시표 없음)', () => {
    const tones = getScaleTones('A', 'NaturalMinor');
    for (const tone of tones) {
      expect(tone).toMatch(/^[A-G]$/);
    }
  });
});

// --- INTERVALS diatonic field ---

describe('INTERVALS diatonic field', () => {
  it('all intervals have valid diatonic values', () => {
    for (const interval of INTERVALS) {
      expect(interval.diatonic).toBeGreaterThanOrEqual(0);
      expect(interval.diatonic).toBeLessThanOrEqual(7);
    }
  });
});

// --- getAllNoteNamesExtended ---

describe('getAllNoteNamesExtended', () => {
  it('returns 17 note names (sharps + flats)', () => {
    const names = getAllNoteNamesExtended();
    expect(names).toHaveLength(17);
    expect(names).toContain('Eb');
    expect(names).toContain('Bb');
    expect(names).toContain('Ab');
    expect(names).toContain('Db');
    expect(names).toContain('Gb');
  });
});

// --- ENHARMONIC_MAP 확장 ---

describe('getEnharmonic extended', () => {
  it('B# ↔ C', () => {
    expect(getEnharmonic('B#')).toBe('C');
  });

  it('Cb ↔ B', () => {
    expect(getEnharmonic('Cb')).toBe('B');
  });

  it('E# ↔ F', () => {
    expect(getEnharmonic('E#')).toBe('F');
  });

  it('Fb ↔ E', () => {
    expect(getEnharmonic('Fb')).toBe('E');
  });
});
