// 오선 위 음표 배치를 위한 레이아웃 계산

// 오선 상수
export const STAFF = {
  TOP: 20,
  GAP: 10,         // 줄 간격
  LINE_COUNT: 5,
  get BOTTOM() { return this.TOP + (this.LINE_COUNT - 1) * this.GAP; },
  get LINES() { return Array.from({ length: this.LINE_COUNT }, (_, i) => this.TOP + i * this.GAP); },
};

// 기준: 높은음자리표 B4 = 셋째 줄 = y40
// 기준: 낮은음자리표 D3 = 셋째 줄 = y40

// 음이름 → 반음 단위 높이 (C0 기준으로 음 높이 순서)
// 오선은 반음이 아니라 온음 단위이므로, 자연음 기준 "스텝" 사용
const NOTE_STEPS: Record<string, number> = {
  'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6,
};

export type Clef = 'treble' | 'bass';

interface NotePosition {
  noteName: string;   // 원본 음 이름 (C#4 등)
  y: number;          // 오선 위 Y좌표
  accidental: '#' | 'b' | null;
  ledgerLines: number[]; // 필요한 덧줄 Y좌표
}

function parseNote(note: string): { letter: string; accidental: '#' | 'b' | null; octave: number } {
  const match = note.match(/^([A-G])(#|b)?(\d)$/);
  if (!match) return { letter: 'C', accidental: null, octave: 4 };
  return {
    letter: match[1],
    accidental: (match[2] as '#' | 'b') ?? null,
    octave: parseInt(match[3]),
  };
}

function noteStep(letter: string, octave: number): number {
  return octave * 7 + NOTE_STEPS[letter];
}

function stepToY(step: number, clef: Clef): number {
  const baseStep = clef === 'treble'
    ? noteStep('B', 4)   // B4 = 셋째 줄 = y40
    : noteStep('D', 3);  // D3 = 셋째 줄 = y40

  const diff = step - baseStep;
  // 위로 갈수록 step 증가, y 감소 (5px per step)
  return 40 - diff * 5;
}

function getLedgerLines(y: number): number[] {
  const lines: number[] = [];
  // 오선 위 덧줄 (y < STAFF.TOP)
  for (let ly = STAFF.TOP - STAFF.GAP; ly >= y; ly -= STAFF.GAP) {
    lines.push(ly);
  }
  // 오선 아래 덧줄 (y > STAFF.BOTTOM)
  for (let ly = STAFF.BOTTOM + STAFF.GAP; ly <= y; ly += STAFF.GAP) {
    lines.push(ly);
  }
  return lines;
}

export function getNotePosition(note: string, clef: Clef): NotePosition {
  const { letter, accidental, octave } = parseNote(note);
  const step = noteStep(letter, octave);
  const y = stepToY(step, clef);

  return {
    noteName: note,
    y,
    accidental,
    ledgerLines: getLedgerLines(y),
  };
}

export function getNotesPositions(notes: string[], clef: Clef): NotePosition[] {
  return notes.map((n) => getNotePosition(n, clef));
}

// 음이름에서 옥타브가 없으면 기본 옥타브 추가
export function withOctave(note: string, clef: Clef): string {
  if (/\d$/.test(note)) return note; // 이미 옥타브 있음
  const defaultOctave = clef === 'treble' ? 4 : 3;
  return `${note}${defaultOctave}`;
}

// 음표의 기둥 방향: 셋째 줄(y=40) 기준, 위면 아래로, 아래면 위로
export function stemDirection(y: number): 'up' | 'down' {
  return y >= 40 ? 'up' : 'down';
}

// 코드에서 인접한 2도 음정이 있을 때 음표를 좌우로 오프셋
export function getChordOffsets(positions: NotePosition[]): number[] {
  const sorted = [...positions].sort((a, b) => b.y - a.y); // y 내림차순 (낮은 음부터)
  const offsets = sorted.map(() => 0);

  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].y - sorted[i - 1].y) <= 5) {
      // 2도 간격: 번갈아 오프셋
      offsets[i] = offsets[i - 1] === 0 ? 12 : 0;
    }
  }

  return offsets;
}
