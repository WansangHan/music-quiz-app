// VexFlow 노트 변환 유틸리티 (순수 함수, DOM 의존성 없음)

export type Clef = 'treble' | 'bass';

export interface VexFlowNote {
  key: string;                    // 'c/4', 'c#/4', 'bb/3'
  accidental: '#' | 'b' | null;
}

const NOTE_ORDER: Record<string, number> = {
  c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6,
};

/**
 * 음이름 문자열 파싱
 * 'C#4' → { letter: 'C', accidental: '#', octave: 4 }
 */
export function parseNoteString(note: string): {
  letter: string;
  accidental: '#' | 'b' | null;
  octave: number;
} {
  const match = note.match(/^([A-G])(#|b)?(\d)$/);
  if (!match) return { letter: 'C', accidental: null, octave: 4 };
  return {
    letter: match[1],
    accidental: (match[2] as '#' | 'b') ?? null,
    octave: parseInt(match[3]),
  };
}

/**
 * 옥타브 없으면 기본값 추가 (treble: 4, bass: 3)
 */
export function withOctave(note: string, clef: Clef): string {
  if (/\d$/.test(note)) return note;
  return `${note}${clef === 'treble' ? 4 : 3}`;
}

/**
 * 앱 노트 형식 → VexFlow 키 형식
 * 'C4'  → { key: 'c/4',  accidental: null }
 * 'C#4' → { key: 'c#/4', accidental: '#' }
 * 'Bb3' → { key: 'bb/3', accidental: 'b' }
 */
export function toVexFlowNote(note: string): VexFlowNote {
  const { letter, accidental, octave } = parseNoteString(note);
  const base = letter.toLowerCase();
  const acc = accidental ?? '';
  return {
    key: `${base}${acc}/${octave}`,
    accidental,
  };
}

/**
 * 여러 음을 변환 (옥타브 기본값 적용)
 */
export function toVexFlowNotes(notes: string[], clef: Clef): VexFlowNote[] {
  return notes.map((n) => toVexFlowNote(withOctave(n, clef)));
}

/**
 * 코드용 정렬: 옥타브 → 음이름 순 (VexFlow 필수)
 * 원본 인덱스도 반환하여 accidental 매핑 유지
 */
export function sortForChord(
  vexNotes: VexFlowNote[],
): { sorted: VexFlowNote[]; originalIndices: number[] } {
  const indexed = vexNotes.map((n, i) => ({ note: n, index: i }));
  indexed.sort((a, b) => {
    const [nameA, octStrA] = a.note.key.split('/');
    const [nameB, octStrB] = b.note.key.split('/');
    const octA = parseInt(octStrA);
    const octB = parseInt(octStrB);
    if (octA !== octB) return octA - octB;
    return NOTE_ORDER[nameA.charAt(0)] - NOTE_ORDER[nameB.charAt(0)];
  });
  return {
    sorted: indexed.map((x) => x.note),
    originalIndices: indexed.map((x) => x.index),
  };
}

/**
 * Voice 파라미터 계산
 */
export function getVoiceParams(
  noteCount: number,
  mode: 'sequential' | 'stacked',
): { numBeats: number; beatValue: number } {
  if (mode === 'stacked') {
    return { numBeats: 4, beatValue: 4 }; // whole note
  }
  return { numBeats: noteCount, beatValue: 4 }; // quarter notes
}

/**
 * 네이티브 폴백용 텍스트 포맷
 */
export function formatNotesText(
  notes: string[],
  mode: 'sequential' | 'stacked',
): string {
  const names = notes.map((n) => n.replace(/\d$/, ''));
  return mode === 'stacked' ? names.join(' + ') : names.join('  ');
}
