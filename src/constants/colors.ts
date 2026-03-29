import { MasteryLevel } from './masteryLevel';
import { TopicCategory } from './topicCategory';

export const Colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  secondary: '#64748B',
  accent: '#F59E0B',
  accentDark: '#D97706',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  cardBackground: '#FFFFFF',
  overlay: 'rgba(15,23,42,0.5)',

  category: {
    [TopicCategory.Interval]: '#6366F1',
    [TopicCategory.Chord]: '#EC4899',
    [TopicCategory.Scale]: '#14B8A6',
    [TopicCategory.ChordTone]: '#F59E0B',
    [TopicCategory.ScaleTone]: '#3B82F6',
    [TopicCategory.NoteName]: '#8B5CF6',
  } as Record<TopicCategory, string>,

  mastery: {
    [MasteryLevel.New]: '#94A3B8',
    [MasteryLevel.Learning]: '#F59E0B',
    [MasteryLevel.Familiar]: '#3B82F6',
    [MasteryLevel.Proficient]: '#10B981',
    [MasteryLevel.Mastered]: '#8B5CF6',
  } as Record<MasteryLevel, string>,
};
