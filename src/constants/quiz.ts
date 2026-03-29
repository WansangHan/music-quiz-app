import { MasteryLevel } from './masteryLevel';

export const MASTERY_INTERVALS: number[][] = [
  [0, 0, 0],
  [0.5, 1, 3],
  [3, 7, 14],
  [7, 14, 30],
  [30, 60, 120],
];

export const PROMOTION_THRESHOLDS = [3, 5, 7, 9];

export const MAX_BONUS_FACTOR = 2.0;
export const BONUS_INCREMENT = 0.1;

export const WRONG_ANSWER_INTERVAL = 0.5;
export const WRONG_ANSWER_DISPLAY_MS = 3000;
export const CORRECT_ANSWER_DISPLAY_MS = 1200;

export const DEFAULT_DAILY_NEW_LIMIT = 5;
export const DEFAULT_QUIZ_BATCH_SIZE = 20;
export const CHOICE_COUNT = 4;

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  [MasteryLevel.New]: '새카드',
  [MasteryLevel.Learning]: '학습중',
  [MasteryLevel.Familiar]: '익숙함',
  [MasteryLevel.Proficient]: '능숙함',
  [MasteryLevel.Mastered]: '완전숙달',
};
