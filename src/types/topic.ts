import { TopicCategory } from '../constants/topicCategory';

export interface NotationInfo {
  notes: string[];                      // ['C4', 'E4'] 등
  mode: 'sequential' | 'stacked';       // 나열 vs 수직
  clef?: 'treble' | 'bass';
}

export interface TopicData {
  id: string;
  category: TopicCategory;
  displayName: string;
  question: string;
  correctAnswer: string;
  description: string;
  difficulty: 1 | 2 | 3;
  sortOrder: number;
  notation?: NotationInfo;
}
