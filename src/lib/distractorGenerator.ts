import { TopicCategory } from '../constants/topicCategory';
import { INTERVALS, CHORD_TYPES, SCALE_TYPES, getAllNoteNames, getSolfege, getEnharmonic } from './musicTheory';
import { CHOICE_COUNT } from '../constants/quiz';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(correct: string, pool: string[], count: number): string[] {
  const filtered = pool.filter((p) => p !== correct);
  return shuffle(filtered).slice(0, count);
}

export function generateChoices(
  category: TopicCategory,
  correctAnswer: string,
  question: string,
): { choices: string[]; correctIndex: number } {
  const needed = CHOICE_COUNT - 1;
  let distractors: string[];

  switch (category) {
    case TopicCategory.Interval: {
      const pool = INTERVALS.filter((i) => i.semitones > 0).map((i) => i.name);
      distractors = pickDistractors(correctAnswer, pool, needed);
      break;
    }
    case TopicCategory.Chord: {
      // 같은 루트의 다른 코드 타입, 또는 다른 루트의 같은 타입
      const pool = CHORD_TYPES.map((c) => {
        const rootMatch = question.match(/^([A-G][#b]?)/);
        const root = rootMatch?.[1] ?? 'C';
        return `${root} ${c.typeKr}`;
      });
      distractors = pickDistractors(correctAnswer, pool, needed);
      if (distractors.length < needed) {
        const notePool = getAllNoteNames().map((n) => `${n} 메이저`);
        const more = pickDistractors(correctAnswer, notePool, needed - distractors.length);
        distractors.push(...more);
      }
      break;
    }
    case TopicCategory.Scale: {
      const allLabels: string[] = [];
      for (const root of getAllNoteNames()) {
        for (const scale of SCALE_TYPES) {
          allLabels.push(`${root} ${scale.typeKr}`);
        }
      }
      distractors = pickDistractors(correctAnswer, allLabels, needed);
      break;
    }
    case TopicCategory.ChordTone:
    case TopicCategory.ScaleTone: {
      const pool = getAllNoteNames();
      distractors = pickDistractors(correctAnswer, pool, needed);
      break;
    }
    case TopicCategory.NoteName: {
      // 질문에 따라 음이름 또는 계이름 풀 사용
      const issolfegeAnswer = getSolfege().includes(correctAnswer);
      const pool = issolfegeAnswer ? getSolfege() : getAllNoteNames();
      distractors = pickDistractors(correctAnswer, pool, needed);
      // 이명동음 질문이면 이명동음을 오답에 포함하지 않도록
      const enharmonic = getEnharmonic(correctAnswer);
      if (enharmonic) {
        distractors = distractors.filter((d) => d !== enharmonic);
        if (distractors.length < needed) {
          const more = pickDistractors(correctAnswer, getAllNoteNames().filter((n) => n !== enharmonic), 1);
          distractors.push(...more);
        }
      }
      break;
    }
  }

  distractors = distractors.slice(0, needed);
  const all = shuffle([correctAnswer, ...distractors]);
  const correctIndex = all.indexOf(correctAnswer);

  return { choices: all, correctIndex };
}
