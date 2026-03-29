// 12음 피치 클래스 산술 기반 음악 이론 순수 함수

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SOLFEGE = ['도', '레', '미', '파', '솔', '라', '시'];
const SOLFEGE_TO_INDEX: Record<string, number> = { '도': 0, '레': 2, '미': 4, '파': 5, '솔': 7, '라': 9, '시': 11 };

// 이명동음 매핑 (# ↔ b)
const ENHARMONIC_MAP: Record<string, string> = {
  'C#': 'Db', 'Db': 'C#',
  'D#': 'Eb', 'Eb': 'D#',
  'F#': 'Gb', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'G#',
  'A#': 'Bb', 'Bb': 'A#',
};

// 이명동음을 포함한 전체 음 이름 → 인덱스
const ALL_NOTE_INDICES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4, 'E#': 5, 'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0,
};

export function noteIndex(name: string): number {
  return ALL_NOTE_INDICES[name] ?? 0;
}

export function noteName(index: number): string {
  return NOTE_NAMES[((index % 12) + 12) % 12];
}

export function transpose(root: string, semitones: number): string {
  return noteName(noteIndex(root) + semitones);
}

export function getEnharmonic(note: string): string | null {
  return ENHARMONIC_MAP[note] ?? null;
}

export function getAllNoteNames(): string[] {
  return [...NOTE_NAMES];
}

export function getSolfege(): string[] {
  return [...SOLFEGE];
}

export function solfegeToNote(solfege: string): string {
  const idx = SOLFEGE_TO_INDEX[solfege];
  return idx !== undefined ? noteName(idx) : 'C';
}

export function noteToSolfege(note: string): string {
  const idx = noteIndex(note);
  const solfegeIdx = [0, -1, 1, -1, 2, 3, -1, 4, -1, 5, -1, 6][idx];
  return solfegeIdx >= 0 ? SOLFEGE[solfegeIdx] : '';
}

// --- 음정 ---

export interface IntervalDef {
  name: string;
  nameEn: string;
  semitones: number;
}

export const INTERVALS: IntervalDef[] = [
  { name: '완전1도', nameEn: 'Perfect Unison', semitones: 0 },
  { name: '단2도', nameEn: 'Minor 2nd', semitones: 1 },
  { name: '장2도', nameEn: 'Major 2nd', semitones: 2 },
  { name: '단3도', nameEn: 'Minor 3rd', semitones: 3 },
  { name: '장3도', nameEn: 'Major 3rd', semitones: 4 },
  { name: '완전4도', nameEn: 'Perfect 4th', semitones: 5 },
  { name: '삼전음', nameEn: 'Tritone', semitones: 6 },
  { name: '완전5도', nameEn: 'Perfect 5th', semitones: 7 },
  { name: '단6도', nameEn: 'Minor 6th', semitones: 8 },
  { name: '장6도', nameEn: 'Major 6th', semitones: 9 },
  { name: '단7도', nameEn: 'Minor 7th', semitones: 10 },
  { name: '장7도', nameEn: 'Major 7th', semitones: 11 },
  { name: '완전8도', nameEn: 'Perfect Octave', semitones: 12 },
];

export function getIntervalName(semitones: number): string {
  return INTERVALS.find((i) => i.semitones === semitones)?.name ?? `${semitones}반음`;
}

export function getIntervalSemitones(name: string): number {
  return INTERVALS.find((i) => i.name === name)?.semitones ?? 0;
}

// --- 코드 ---

export interface ChordDef {
  type: string;
  typeKr: string;
  formula: number[]; // 반음 간격
}

export const CHORD_TYPES: ChordDef[] = [
  { type: 'Major', typeKr: '메이저', formula: [0, 4, 7] },
  { type: 'Minor', typeKr: '마이너', formula: [0, 3, 7] },
  { type: 'Diminished', typeKr: '디미니쉬드', formula: [0, 3, 6] },
  { type: 'Augmented', typeKr: '어그먼티드', formula: [0, 4, 8] },
  { type: 'Major7', typeKr: '메이저 7', formula: [0, 4, 7, 11] },
  { type: 'Minor7', typeKr: '마이너 7', formula: [0, 3, 7, 10] },
  { type: 'Dominant7', typeKr: '도미넌트 7', formula: [0, 4, 7, 10] },
];

export function getChordTones(root: string, chordType: string): string[] {
  const def = CHORD_TYPES.find((c) => c.type === chordType);
  if (!def) return [root];
  return def.formula.map((s) => transpose(root, s));
}

export function getChordLabel(root: string, chordType: string): string {
  const def = CHORD_TYPES.find((c) => c.type === chordType);
  return `${root} ${def?.typeKr ?? chordType}`;
}

export function getToneLabel(index: number, total: number): string {
  if (total <= 3) {
    return ['근음', '3음', '5음'][index] ?? `${index + 1}음`;
  }
  return ['근음', '3음', '5음', '7음'][index] ?? `${index + 1}음`;
}

// --- 스케일 ---

export interface ScaleDef {
  type: string;
  typeKr: string;
  pattern: number[]; // 반음 간격 (7도)
}

export const SCALE_TYPES: ScaleDef[] = [
  { type: 'Major', typeKr: '메이저', pattern: [0, 2, 4, 5, 7, 9, 11] },
  { type: 'NaturalMinor', typeKr: '내추럴 마이너', pattern: [0, 2, 3, 5, 7, 8, 10] },
];

export function getScaleTones(root: string, scaleType: string): string[] {
  const def = SCALE_TYPES.find((s) => s.type === scaleType);
  if (!def) return [root];
  return def.pattern.map((s) => transpose(root, s));
}

export function getScaleLabel(root: string, scaleType: string): string {
  const def = SCALE_TYPES.find((s) => s.type === scaleType);
  return `${root} ${def?.typeKr ?? scaleType}`;
}

export function getDegreeName(degree: number): string {
  return `${degree}음`;
}

// --- 루트 음 목록 ---

export const NATURAL_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const CHROMATIC_ROOTS = NOTE_NAMES;
