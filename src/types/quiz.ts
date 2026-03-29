import { TopicData } from './topic';
import { MasteryLevel } from './progress';

export { QuizState } from '../constants/quizState';

export interface QuizCardMeta {
  masteryLevel: MasteryLevel;
  lastReviewedAt: string | null;
  totalReviews: number;
  totalCorrect: number;
}

export interface QuizCard {
  topic: TopicData;
  choices: string[];
  correctIndex: number;
  meta?: QuizCardMeta;
}

export interface AnswerResult {
  topicId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  previousLevel: MasteryLevel;
  newLevel: MasteryLevel;
  newStreak: number;
  promotionThreshold: number;
  didLevelUp: boolean;
}

export interface MasteryChange {
  topicName: string;
  oldLevel: MasteryLevel;
  newLevel: MasteryLevel;
}

export interface QuizSessionSummary {
  totalCards: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  levelUps: number;
  masteryChanges: MasteryChange[];
}
