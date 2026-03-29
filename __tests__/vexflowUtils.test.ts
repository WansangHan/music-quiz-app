import {
  parseNoteString,
  withOctave,
  toVexFlowNote,
  toVexFlowNotes,
  sortForChord,
  getVoiceParams,
  formatNotesText,
} from '../src/lib/vexflowUtils';

// --- parseNoteString ---

describe('parseNoteString', () => {
  it('parses natural note', () => {
    expect(parseNoteString('C4')).toEqual({ letter: 'C', accidental: null, octave: 4 });
  });

  it('parses sharp note', () => {
    expect(parseNoteString('F#4')).toEqual({ letter: 'F', accidental: '#', octave: 4 });
  });

  it('parses flat note', () => {
    expect(parseNoteString('Bb3')).toEqual({ letter: 'B', accidental: 'b', octave: 3 });
  });

  it('parses Db4', () => {
    expect(parseNoteString('Db4')).toEqual({ letter: 'D', accidental: 'b', octave: 4 });
  });

  it('falls back for invalid input', () => {
    expect(parseNoteString('XYZ')).toEqual({ letter: 'C', accidental: null, octave: 4 });
  });

  it('falls back for empty string', () => {
    expect(parseNoteString('')).toEqual({ letter: 'C', accidental: null, octave: 4 });
  });

  it('parses all 7 natural notes', () => {
    for (const letter of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      const result = parseNoteString(`${letter}5`);
      expect(result.letter).toBe(letter);
      expect(result.octave).toBe(5);
    }
  });
});

// --- withOctave ---

describe('withOctave', () => {
  it('adds octave 4 for treble when missing', () => {
    expect(withOctave('C', 'treble')).toBe('C4');
    expect(withOctave('F#', 'treble')).toBe('F#4');
  });

  it('adds octave 3 for bass when missing', () => {
    expect(withOctave('C', 'bass')).toBe('C3');
    expect(withOctave('Bb', 'bass')).toBe('Bb3');
  });

  it('preserves existing octave', () => {
    expect(withOctave('C5', 'treble')).toBe('C5');
    expect(withOctave('G2', 'bass')).toBe('G2');
  });
});

// --- toVexFlowNote ---

describe('toVexFlowNote', () => {
  it('converts natural note', () => {
    expect(toVexFlowNote('C4')).toEqual({ key: 'c/4', accidental: null });
  });

  it('converts sharp note', () => {
    expect(toVexFlowNote('C#4')).toEqual({ key: 'c#/4', accidental: '#' });
  });

  it('converts flat note', () => {
    expect(toVexFlowNote('Bb3')).toEqual({ key: 'bb/3', accidental: 'b' });
  });

  it('converts Db4', () => {
    expect(toVexFlowNote('Db4')).toEqual({ key: 'db/4', accidental: 'b' });
  });

  it('falls back to c/4 for invalid', () => {
    expect(toVexFlowNote('XYZ')).toEqual({ key: 'c/4', accidental: null });
  });

  it('handles all accidental types', () => {
    expect(toVexFlowNote('F#5').key).toBe('f#/5');
    expect(toVexFlowNote('Eb3').key).toBe('eb/3');
    expect(toVexFlowNote('G4').key).toBe('g/4');
  });
});

// --- toVexFlowNotes ---

describe('toVexFlowNotes', () => {
  it('converts multiple notes with clef defaults', () => {
    const result = toVexFlowNotes(['C', 'E', 'G'], 'treble');
    expect(result).toEqual([
      { key: 'c/4', accidental: null },
      { key: 'e/4', accidental: null },
      { key: 'g/4', accidental: null },
    ]);
  });

  it('applies bass clef default octave', () => {
    const result = toVexFlowNotes(['C', 'E'], 'bass');
    expect(result[0].key).toBe('c/3');
    expect(result[1].key).toBe('e/3');
  });

  it('preserves explicit octaves', () => {
    const result = toVexFlowNotes(['C5', 'G3'], 'treble');
    expect(result[0].key).toBe('c/5');
    expect(result[1].key).toBe('g/3');
  });

  it('handles mixed accidentals', () => {
    const result = toVexFlowNotes(['C#4', 'Eb4', 'G4'], 'treble');
    expect(result[0]).toEqual({ key: 'c#/4', accidental: '#' });
    expect(result[1]).toEqual({ key: 'eb/4', accidental: 'b' });
    expect(result[2]).toEqual({ key: 'g/4', accidental: null });
  });
});

// --- sortForChord ---

describe('sortForChord', () => {
  it('sorts by octave then note name', () => {
    const notes = toVexFlowNotes(['G4', 'C4', 'E4'], 'treble');
    const { sorted } = sortForChord(notes);
    expect(sorted.map((n) => n.key)).toEqual(['c/4', 'e/4', 'g/4']);
  });

  it('sorts across octaves', () => {
    const notes = toVexFlowNotes(['C5', 'G4', 'E4'], 'treble');
    const { sorted } = sortForChord(notes);
    expect(sorted.map((n) => n.key)).toEqual(['e/4', 'g/4', 'c/5']);
  });

  it('returns correct original indices', () => {
    const notes = toVexFlowNotes(['G4', 'C4', 'E4'], 'treble');
    const { originalIndices } = sortForChord(notes);
    // G4(idx0) → 3rd, C4(idx1) → 1st, E4(idx2) → 2nd
    expect(originalIndices).toEqual([1, 2, 0]);
  });

  it('handles single note', () => {
    const notes = toVexFlowNotes(['C4'], 'treble');
    const { sorted } = sortForChord(notes);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].key).toBe('c/4');
  });

  it('preserves accidentals through sort', () => {
    const notes = toVexFlowNotes(['Bb4', 'F#4'], 'treble');
    const { sorted } = sortForChord(notes);
    expect(sorted[0]).toEqual({ key: 'f#/4', accidental: '#' });
    expect(sorted[1]).toEqual({ key: 'bb/4', accidental: 'b' });
  });
});

// --- getVoiceParams ---

describe('getVoiceParams', () => {
  it('sequential: N quarter notes', () => {
    expect(getVoiceParams(3, 'sequential')).toEqual({ numBeats: 3, beatValue: 4 });
    expect(getVoiceParams(7, 'sequential')).toEqual({ numBeats: 7, beatValue: 4 });
  });

  it('stacked: whole note (4 beats)', () => {
    expect(getVoiceParams(1, 'stacked')).toEqual({ numBeats: 4, beatValue: 4 });
    expect(getVoiceParams(4, 'stacked')).toEqual({ numBeats: 4, beatValue: 4 });
  });
});

// --- formatNotesText ---

describe('formatNotesText', () => {
  it('sequential: space-separated', () => {
    expect(formatNotesText(['C4', 'E4', 'G4'], 'sequential')).toBe('C  E  G');
  });

  it('stacked: plus-separated', () => {
    expect(formatNotesText(['C4', 'E4', 'G4'], 'stacked')).toBe('C + E + G');
  });

  it('strips octave numbers', () => {
    expect(formatNotesText(['C#4', 'Bb3'], 'sequential')).toBe('C#  Bb');
  });

  it('single note', () => {
    expect(formatNotesText(['C4'], 'sequential')).toBe('C');
  });
});
