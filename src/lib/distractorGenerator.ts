import { TopicCategory } from '../constants/topicCategory';
import { INTERVALS, CHORD_TYPES, SCALE_TYPES, NATURAL_ROOTS, getAllNoteNamesExtended, getSolfege, getEnharmonic } from './musicTheory';
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
      // 같은 루트 2개 + 다른 루트 1개
      const rootMatch = question.match(/^([A-G][#b]?)/);
      const root = rootMatch?.[1] ?? 'C';
      const sameRootPool = CHORD_TYPES.map((c) => `${root} ${c.typeKr}`);
      const sameRoot = pickDistractors(correctAnswer, sameRootPool, 2);
      const diffRootPool = NATURAL_ROOTS
        .filter((r) => r !== root)
        .flatMap((r) => CHORD_TYPES.map((c) => `${r} ${c.typeKr}`));
      const diffRoot = pickDistractors(correctAnswer, diffRootPool, 1);
      distractors = [...sameRoot, ...diffRoot];
      break;
    }
    case TopicCategory.Scale: {
      const allLabels: string[] = [];
      for (const root of NATURAL_ROOTS) {
        for (const scale of SCALE_TYPES) {
          allLabels.push(`${root} ${scale.typeKr}`);
        }
      }
      distractors = pickDistractors(correctAnswer, allLabels, needed);
      break;
    }
    case TopicCategory.ChordTone:
    case TopicCategory.ScaleTone: {
      const pool = getAllNoteNamesExtended();
      const enh = getEnharmonic(correctAnswer);
      const filtered = pool.filter((p) => p !== correctAnswer && p !== enh);
      distractors = shuffle(filtered).slice(0, needed);
      break;
    }
    case TopicCategory.NoteName: {
      const isSolfegeAnswer = getSolfege().includes(correctAnswer);
      const pool = isSolfegeAnswer ? getSolfege() : getAllNoteNamesExtended();
      const enh = getEnharmonic(correctAnswer);
      const filtered = pool.filter((p) => p !== correctAnswer && p !== enh);
      distractors = shuffle(filtered).slice(0, needed);
      break;
    }
  }

  distractors = distractors.slice(0, needed);
  const all = shuffle([correctAnswer, ...distractors]);
  const correctIndex = all.indexOf(correctAnswer);

  return { choices: all, correctIndex };
}
