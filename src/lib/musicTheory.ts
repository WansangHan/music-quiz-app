// 음정 기반 음악 이론 순수 함수 (다이아토닉 + 크로매틱 2축 계산)

// --- 기본 상수 ---

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_CHROMATIC = [0, 2, 4, 5, 7, 9, 11]; // 자연음의 크로매틱 인덱스

const SOLFEGE = ['도', '레', '미', '파', '솔', '라', '시'];
const SOLFEGE_TO_INDEX: Record<string, number> = { '도': 0, '레': 2, '미': 4, '파': 5, '솔': 7, '라': 9, '시': 11 };

const ENHARMONIC_MAP: Record<string, string> = {
  'C#': 'Db', 'Db': 'C#',
  'D#': 'Eb', 'Eb': 'D#',
  'E#': 'F', 'Fb': 'E',
  'F#': 'Gb', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'G#',
  'A#': 'Bb', 'Bb': 'A#',
  'B#': 'C', 'Cb': 'B',
};

const ALL_NOTE_INDICES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4, 'E#': 5, 'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0,
};

// 17개 음이름 (# + b 모두 포함, 오답지 풀용)
const NOTE_NAMES_EXTENDED = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
];

// --- 기본 함수 ---

export function noteIndex(name: string): number {
  return ALL_NOTE_INDICES[name] ?? 0;
}

export function noteName(index: number): string {
  return NOTE_NAMES[((index % 12) + 12) % 12];
}

/** 반음 기반 전위 (레거시, 이명동음 철자 무시) */
export function transpose(root: string, semitones: number): string {
  return noteName(noteIndex(root) + semitones);
}

export function getEnharmonic(note: string): string | null {
  return ENHARMONIC_MAP[note] ?? null;
}

export function getAllNoteNames(): string[] {
  return [...NOTE_NAMES];
}

export function getAllNoteNamesExtended(): string[] {
  return [...NOTE_NAMES_EXTENDED];
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

// --- 음정 (Interval) ---

export interface Interval {
  diatonic: number;  // 0=1도, 1=2도, 2=3도, 3=4도, 4=5도, 5=6도, 6=7도, 7=8도
  semitones: number;
}

// 음정 상수 (코드/스케일 공식용)
export const P1: Interval = { diatonic: 0, semitones: 0 };
export const m2: Interval = { diatonic: 1, semitones: 1 };
export const M2: Interval = { diatonic: 1, semitones: 2 };
export const m3: Interval = { diatonic: 2, semitones: 3 };
export const M3: Interval = { diatonic: 2, semitones: 4 };
export const P4: Interval = { diatonic: 3, semitones: 5 };
export const A4: Interval = { diatonic: 3, semitones: 6 };
export const d5: Interval = { diatonic: 4, semitones: 6 };
export const P5: Interval = { diatonic: 4, semitones: 7 };
export const A5: Interval = { diatonic: 4, semitones: 8 };
export const m6: Interval = { diatonic: 5, semitones: 8 };
export const M6: Interval = { diatonic: 5, semitones: 9 };
export const m7: Interval = { diatonic: 6, semitones: 10 };
export const M7: Interval = { diatonic: 6, semitones: 11 };
export const P8: Interval = { diatonic: 7, semitones: 12 };

/**
 * 음정 기반 전위 — 올바른 이명동음 철자 산출.
 * 다이아토닉 스텝으로 음이름 결정, 크로매틱으로 임시표 결정.
 * 이중 임시표(##, bb) 발생 시 자동 정규화.
 */
export function transposeByInterval(root: string, interval: Interval): string {
  const rootLetter = root.charAt(0);
  const rootAcc = root.slice(1);
  const rootLetterIdx = LETTERS.indexOf(rootLetter);
  if (rootLetterIdx === -1) return root;

  const accSemitones = rootAcc === '#' ? 1 : rootAcc === 'b' ? -1 : 0;
  const rootChromatic = LETTER_CHROMATIC[rootLetterIdx] + accSemitones;

  // 타겟 음이름 (다이아토닉 스텝)
  const targetLetterIdx = (rootLetterIdx + interval.diatonic) % 7;
  const targetLetter = LETTERS[targetLetterIdx];
  const targetNatural = LETTER_CHROMATIC[targetLetterIdx];

  // 필요한 크로매틱 인덱스
  const needed = ((rootChromatic + interval.semitones) % 12 + 12) % 12;

  // 임시표 계산 (signed modular difference)
  const diff = ((needed - targetNatural + 6) % 12 + 12) % 12 - 6;

  // 이중 임시표 정규화
  if (Math.abs(diff) > 1) {
    return noteName(needed);
  }

  const accStr = diff === 0 ? '' : diff === 1 ? '#' : 'b';
  return `${targetLetter}${accStr}`;
}

// --- 음정 정의 (퀴즈용) ---

export interface IntervalDef {
  name: string;
  nameEn: string;
  semitones: number;
  diatonic: number;
}

export const INTERVALS: IntervalDef[] = [
  { name: '완전1도', nameEn: 'Perfect Unison', semitones: 0, diatonic: 0 },
  { name: '단2도', nameEn: 'Minor 2nd', semitones: 1, diatonic: 1 },
  { name: '장2도', nameEn: 'Major 2nd', semitones: 2, diatonic: 1 },
  { name: '단3도', nameEn: 'Minor 3rd', semitones: 3, diatonic: 2 },
  { name: '장3도', nameEn: 'Major 3rd', semitones: 4, diatonic: 2 },
  { name: '완전4도', nameEn: 'Perfect 4th', semitones: 5, diatonic: 3 },
  { name: '삼전음', nameEn: 'Tritone', semitones: 6, diatonic: 3 },
  { name: '완전5도', nameEn: 'Perfect 5th', semitones: 7, diatonic: 4 },
  { name: '단6도', nameEn: 'Minor 6th', semitones: 8, diatonic: 5 },
  { name: '장6도', nameEn: 'Major 6th', semitones: 9, diatonic: 5 },
  { name: '단7도', nameEn: 'Minor 7th', semitones: 10, diatonic: 6 },
  { name: '장7도', nameEn: 'Major 7th', semitones: 11, diatonic: 6 },
  { name: '완전8도', nameEn: 'Perfect Octave', semitones: 12, diatonic: 7 },
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
  formula: Interval[];
}

export const CHORD_TYPES: ChordDef[] = [
  { type: 'Major', typeKr: '메이저', formula: [P1, M3, P5] },
  { type: 'Minor', typeKr: '마이너', formula: [P1, m3, P5] },
  { type: 'Diminished', typeKr: '디미니쉬드', formula: [P1, m3, d5] },
  { type: 'Augmented', typeKr: '어그먼티드', formula: [P1, M3, A5] },
  { type: 'Major7', typeKr: '메이저 7', formula: [P1, M3, P5, M7] },
  { type: 'Minor7', typeKr: '마이너 7', formula: [P1, m3, P5, m7] },
  { type: 'Dominant7', typeKr: '도미넌트 7', formula: [P1, M3, P5, m7] },
];

export function getChordTones(root: string, chordType: string): string[] {
  const def = CHORD_TYPES.find((c) => c.type === chordType);
  if (!def) return [root];
  return def.formula.map((interval) => transposeByInterval(root, interval));
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
  pattern: Interval[];
}

export const SCALE_TYPES: ScaleDef[] = [
  { type: 'Major', typeKr: '메이저', pattern: [P1, M2, M3, P4, P5, M6, M7] },
  { type: 'NaturalMinor', typeKr: '내추럴 마이너', pattern: [P1, M2, m3, P4, P5, m6, m7] },
];

export function getScaleTones(root: string, scaleType: string): string[] {
  const def = SCALE_TYPES.find((s) => s.type === scaleType);
  if (!def) return [root];
  return def.pattern.map((interval) => transposeByInterval(root, interval));
}

export function getScaleLabel(root: string, scaleType: string): string {
  const def = SCALE_TYPES.find((s) => s.type === scaleType);
  return `${root} ${def?.typeKr ?? scaleType}`;
}

export function getDegreeName(degree: number): string {
  return `${degree}음`;
}

// --- 옥타브 배정 (근음 기준 오름차순) ---

export function assignOctaves(tones: string[], baseOctave: number = 4): string[] {
  if (tones.length === 0) return [];
  const rootIdx = noteIndex(tones[0]);
  return tones.map((tone) => {
    const idx = noteIndex(tone);
    const oct = idx < rootIdx ? baseOctave + 1 : baseOctave;
    return `${tone}${oct}`;
  });
}

// --- 루트 음 목록 ---

export const NATURAL_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const CHROMATIC_ROOTS = NOTE_NAMES;
