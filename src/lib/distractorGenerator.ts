import { TopicCategory } from '../constants/topicCategory';
import { INTERVALS, CHORD_TYPES, SCALE_TYPES, getAllNoteNames, getSolfege } from './musicTheory';
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
      // 같은 루트의 다른 코드 타입
      const rootMatch = question.match(/^([A-G][#b]?)/);
      const root = rootMatch?.[1] ?? 'C';
      const pool = CHORD_TYPES.map((c) => `${root} ${c.typeKr}`);
      distractors = pickDistractors(correctAnswer, pool, needed);
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
      const isSolfegeAnswer = getSolfege().includes(correctAnswer);
      const pool = isSolfegeAnswer ? getSolfege() : getAllNoteNames();
      distractors = pickDistractors(correctAnswer, pool, needed);
      break;
    }
  }

  distractors = distractors.slice(0, needed);
  const all = shuffle([correctAnswer, ...distractors]);
  const correctIndex = all.indexOf(correctAnswer);

  return { choices: all, correctIndex };
}
