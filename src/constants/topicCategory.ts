export enum TopicCategory {
  Interval = 'interval',
  Chord = 'chord',
  Scale = 'scale',
  ChordTone = 'chord_tone',
  ScaleTone = 'scale_tone',
  NoteName = 'note_name',
}

export const CATEGORY_LABELS: Record<TopicCategory, string> = {
  [TopicCategory.Interval]: '음정',
  [TopicCategory.Chord]: '코드',
  [TopicCategory.Scale]: '스케일',
  [TopicCategory.ChordTone]: '코드 구성음',
  [TopicCategory.ScaleTone]: '스케일 구성음',
  [TopicCategory.NoteName]: '음이름',
};

export const CATEGORY_ICONS: Record<TopicCategory, string> = {
  [TopicCategory.Interval]: 'git-compare-outline',
  [TopicCategory.Chord]: 'layers-outline',
  [TopicCategory.Scale]: 'trending-up-outline',
  [TopicCategory.ChordTone]: 'musical-notes-outline',
  [TopicCategory.ScaleTone]: 'musical-note-outline',
  [TopicCategory.NoteName]: 'text-outline',
};
