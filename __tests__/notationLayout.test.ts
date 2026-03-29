import {
  STAFF,
  getNotePosition,
  getNotesPositions,
  withOctave,
  stemDirection,
  getChordOffsets,
} from '../src/lib/notationLayout';

// --- STAFF constants ---

describe('STAFF', () => {
  it('has 5 lines', () => {
    expect(STAFF.LINE_COUNT).toBe(5);
    expect(STAFF.LINES).toHaveLength(5);
  });

  it('lines are evenly spaced', () => {
    const lines = STAFF.LINES;
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i] - lines[i - 1]).toBe(STAFF.GAP);
    }
  });

  it('BOTTOM = TOP + 4 * GAP', () => {
    expect(STAFF.BOTTOM).toBe(STAFF.TOP + 4 * STAFF.GAP);
  });
});

// --- getNotePosition ---

describe('getNotePosition', () => {
  describe('treble clef', () => {
    it('B4 is on the middle line (y=40)', () => {
      const pos = getNotePosition('B4', 'treble');
      expect(pos.y).toBe(40);
      expect(pos.accidental).toBeNull();
      expect(pos.ledgerLines).toEqual([]);
    });

    it('E4 is on the first line (y=60)', () => {
      const pos = getNotePosition('E4', 'treble');
      expect(pos.y).toBe(60);
    });

    it('F5 is on the top line (y=20)', () => {
      const pos = getNotePosition('F5', 'treble');
      expect(pos.y).toBe(20);
    });

    it('C4 is below the staff with ledger line', () => {
      const pos = getNotePosition('C4', 'treble');
      expect(pos.y).toBeGreaterThan(STAFF.BOTTOM);
      expect(pos.ledgerLines.length).toBeGreaterThan(0);
    });

    it('G5 is above the top line (in space, no ledger line)', () => {
      const pos = getNotePosition('G5', 'treble');
      expect(pos.y).toBeLessThan(STAFF.TOP);
      expect(pos.ledgerLines).toEqual([]); // space above top line
    });

    it('A5 is above the staff with one ledger line', () => {
      const pos = getNotePosition('A5', 'treble');
      expect(pos.y).toBeLessThan(STAFF.TOP);
      expect(pos.ledgerLines).toHaveLength(1);
    });

    it('higher notes have lower y values', () => {
      const c4 = getNotePosition('C4', 'treble');
      const e4 = getNotePosition('E4', 'treble');
      const g4 = getNotePosition('G4', 'treble');
      const b4 = getNotePosition('B4', 'treble');
      expect(c4.y).toBeGreaterThan(e4.y);
      expect(e4.y).toBeGreaterThan(g4.y);
      expect(g4.y).toBeGreaterThan(b4.y);
    });

    it('adjacent natural notes differ by 5px', () => {
      const c4 = getNotePosition('C4', 'treble');
      const d4 = getNotePosition('D4', 'treble');
      expect(c4.y - d4.y).toBe(5);
    });
  });

  describe('bass clef', () => {
    it('D3 is on the middle line (y=40)', () => {
      const pos = getNotePosition('D3', 'bass');
      expect(pos.y).toBe(40);
    });

    it('G2 is on the bottom line (y=60)', () => {
      const pos = getNotePosition('G2', 'bass');
      expect(pos.y).toBe(60);
    });

    it('A3 is on the top line (y=20)', () => {
      const pos = getNotePosition('A3', 'bass');
      expect(pos.y).toBe(20);
    });
  });

  describe('accidentals', () => {
    it('detects sharp', () => {
      const pos = getNotePosition('F#4', 'treble');
      expect(pos.accidental).toBe('#');
    });

    it('detects flat', () => {
      const pos = getNotePosition('Bb4', 'treble');
      expect(pos.accidental).toBe('b');
    });

    it('natural note has no accidental', () => {
      const pos = getNotePosition('C4', 'treble');
      expect(pos.accidental).toBeNull();
    });

    it('sharp and natural have same Y (same staff position)', () => {
      const f = getNotePosition('F4', 'treble');
      const fSharp = getNotePosition('F#4', 'treble');
      expect(f.y).toBe(fSharp.y);
    });
  });

  describe('ledger lines', () => {
    it('notes on staff have no ledger lines', () => {
      const notes = ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];
      for (const n of notes) {
        const pos = getNotePosition(n, 'treble');
        expect(pos.ledgerLines).toEqual([]);
      }
    });

    it('C4 in treble has exactly one ledger line', () => {
      const pos = getNotePosition('C4', 'treble');
      expect(pos.ledgerLines).toHaveLength(1);
    });

    it('A3 in treble has multiple ledger lines', () => {
      const pos = getNotePosition('A3', 'treble');
      expect(pos.ledgerLines.length).toBeGreaterThan(1);
    });

    it('A5 in treble has ledger line above', () => {
      const pos = getNotePosition('A5', 'treble');
      expect(pos.ledgerLines.length).toBeGreaterThan(0);
      for (const ly of pos.ledgerLines) {
        expect(ly).toBeLessThan(STAFF.TOP);
      }
    });

    it('B5 in treble has ledger line at same position as A5', () => {
      const a5 = getNotePosition('A5', 'treble');
      const b5 = getNotePosition('B5', 'treble');
      // B5 sits on the ledger line, A5 is in the space below it — same ledger line
      expect(b5.ledgerLines).toHaveLength(1);
      expect(a5.ledgerLines[0]).toBe(b5.ledgerLines[0]);
    });
  });

  describe('invalid input', () => {
    it('falls back to C4 for unparseable note', () => {
      const pos = getNotePosition('XYZ', 'treble');
      const c4 = getNotePosition('C4', 'treble');
      expect(pos.y).toBe(c4.y);
      expect(pos.accidental).toBeNull();
    });
  });
});

// --- getNotesPositions ---

describe('getNotesPositions', () => {
  it('returns positions for all notes', () => {
    const positions = getNotesPositions(['C4', 'E4', 'G4'], 'treble');
    expect(positions).toHaveLength(3);
    expect(positions[0].noteName).toBe('C4');
    expect(positions[2].noteName).toBe('G4');
  });

  it('positions are in same order as input', () => {
    const positions = getNotesPositions(['G4', 'C4'], 'treble');
    expect(positions[0].y).toBeLessThan(positions[1].y); // G4 is higher (lower y)
  });
});

// --- withOctave ---

describe('withOctave', () => {
  it('adds octave 4 for treble clef when missing', () => {
    expect(withOctave('C', 'treble')).toBe('C4');
    expect(withOctave('F#', 'treble')).toBe('F#4');
  });

  it('adds octave 3 for bass clef when missing', () => {
    expect(withOctave('C', 'bass')).toBe('C3');
    expect(withOctave('Bb', 'bass')).toBe('Bb3');
  });

  it('preserves existing octave', () => {
    expect(withOctave('C5', 'treble')).toBe('C5');
    expect(withOctave('G2', 'bass')).toBe('G2');
  });
});

// --- stemDirection ---

describe('stemDirection', () => {
  it('returns up for notes on or below middle line', () => {
    expect(stemDirection(40)).toBe('up');
    expect(stemDirection(50)).toBe('up');
    expect(stemDirection(60)).toBe('up');
    expect(stemDirection(70)).toBe('up');
  });

  it('returns down for notes above middle line', () => {
    expect(stemDirection(35)).toBe('down');
    expect(stemDirection(20)).toBe('down');
    expect(stemDirection(0)).toBe('down');
  });
});

// --- getChordOffsets ---

describe('getChordOffsets', () => {
  it('returns all zeros for widely spaced notes', () => {
    const positions = getNotesPositions(['C4', 'E4', 'G4'], 'treble');
    const offsets = getChordOffsets(positions);
    expect(offsets).toEqual([0, 0, 0]);
  });

  it('offsets adjacent 2nd-interval notes', () => {
    // C4 and D4 are 5px apart (one step)
    const positions = getNotesPositions(['C4', 'D4'], 'treble');
    const offsets = getChordOffsets(positions);
    // One of them should be offset
    expect(offsets.some((o) => o > 0)).toBe(true);
  });

  it('alternates offsets for consecutive seconds', () => {
    // C4, D4, E4 — all adjacent
    const positions = getNotesPositions(['C4', 'D4', 'E4'], 'treble');
    const offsets = getChordOffsets(positions);
    // Should alternate: e.g., [0, 12, 0]
    const hasOffset = offsets.filter((o) => o > 0).length;
    expect(hasOffset).toBeGreaterThan(0);
  });

  it('returns all zeros for single note', () => {
    const positions = getNotesPositions(['C4'], 'treble');
    const offsets = getChordOffsets(positions);
    expect(offsets).toEqual([0]);
  });
});
