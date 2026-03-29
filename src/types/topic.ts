import { TopicCategory } from '../constants/topicCategory';

export interface TopicData {
  id: string;
  category: TopicCategory;
  displayName: string;
  question: string;
  correctAnswer: string;
  description: string;
  difficulty: 1 | 2 | 3;
  sortOrder: number;
}
