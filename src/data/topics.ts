import { TopicData } from '../types/topic';
import { TopicCategory } from '../constants/topicCategory';
import {
  NATURAL_ROOTS,
  INTERVALS,
  CHORD_TYPES,
  SCALE_TYPES,
  transposeByInterval,
  assignOctaves,
  getChordTones,
  getChordLabel,
  getToneLabel,
  getScaleTones,
  getScaleLabel,
  getDegreeName,
  solfegeToNote,
  noteToSolfege,
  getSolfege,
} from '../lib/musicTheory';

function generateIntervalTopics(): TopicData[] {
  const topics: TopicData[] = [];
  let order = 0;

  for (const root of NATURAL_ROOTS) {
    for (const interval of INTERVALS) {
      if (interval.semitones === 0) continue;
      if (interval.semitones === 12) continue;

      const target = transposeByInterval(root, interval);
      topics.push({
        id: `interval_${root}_${interval.semitones}`,
        category: TopicCategory.Interval,
        displayName: `${root}→${target} ${interval.name}`,
        question: `${root}에서 ${target}까지의 음정은?`,
        correctAnswer: interval.name,
        description: `${interval.semitones}반음. ${interval.nameEn}`,
        difficulty: interval.semitones <= 5 ? 1 : interval.semitones <= 9 ? 2 : 3,
        sortOrder: order++,
        notation: { notes: assignOctaves([root, target]), mode: 'sequential' },
      });
    }
  }

  return topics;
}

function generateChordTopics(): TopicData[] {
  const topics: TopicData[] = [];
  let order = 0;

  for (const root of NATURAL_ROOTS) {
    for (const chord of CHORD_TYPES) {
      const tones = getChordTones(root, chord.type);
      const label = getChordLabel(root, chord.type);
      const tonesStr = tones.join(', ');

      topics.push({
        id: `chord_${root}_${chord.type}`,
        category: TopicCategory.Chord,
        displayName: label,
        question: `${tonesStr} 구성음의 코드는?`,
        correctAnswer: label,
        description: `${root} ${chord.typeKr} (${chord.type}): ${tonesStr}`,
        difficulty: chord.formula.length <= 3 ? 1 : 2,
        sortOrder: order++,
        notation: { notes: assignOctaves(tones), mode: 'stacked' },
      });
    }
  }

  return topics;
}

function generateScaleTopics(): TopicData[] {
  const topics: TopicData[] = [];
  let order = 0;

  for (const root of NATURAL_ROOTS) {
    for (const scale of SCALE_TYPES) {
      const tones = getScaleTones(root, scale.type);
      const label = getScaleLabel(root, scale.type);
      const tonesStr = tones.join(' ');

      topics.push({
        id: `scale_${root}_${scale.type}`,
        category: TopicCategory.Scale,
        displayName: label,
        question: `${tonesStr}의 스케일은?`,
        correctAnswer: label,
        description: `${label}: ${tonesStr}`,
        difficulty: scale.type === 'Major' ? 1 : 2,
        sortOrder: order++,
        notation: { notes: assignOctaves(tones), mode: 'sequential' },
      });
    }
  }

  return topics;
}

function generateChordToneTopics(): TopicData[] {
  const topics: TopicData[] = [];
  let order = 0;

  for (const root of NATURAL_ROOTS) {
    for (const chord of CHORD_TYPES) {
      const tones = getChordTones(root, chord.type);
      const label = getChordLabel(root, chord.type);

      for (let i = 0; i < tones.length; i++) {
        const toneName = getToneLabel(i, tones.length);
        topics.push({
          id: `chordtone_${root}_${chord.type}_${i}`,
          category: TopicCategory.ChordTone,
          displayName: `${label}의 ${toneName}`,
          question: `${label} 코드의 ${toneName}은?`,
          correctAnswer: tones[i],
          description: `${label}: ${tones.map((t, j) => `${getToneLabel(j, tones.length)}=${t}`).join(', ')}`,
          difficulty: i === 0 ? 1 : chord.formula.length > 3 ? 3 : 2,
          sortOrder: order++,
          notation: { notes: assignOctaves(tones), mode: 'stacked' },
        });
      }
    }
  }

  return topics;
}

function generateScaleToneTopics(): TopicData[] {
  const topics: TopicData[] = [];
  let order = 0;

  for (const root of NATURAL_ROOTS) {
    for (const scale of SCALE_TYPES) {
      const tones = getScaleTones(root, scale.type);
      const label = getScaleLabel(root, scale.type);

      for (let i = 0; i < tones.length; i++) {
        const degree = i + 1;
        topics.push({
          id: `scaletone_${root}_${scale.type}_${degree}`,
          category: TopicCategory.ScaleTone,
          displayName: `${label}의 ${getDegreeName(degree)}`,
          question: `${label} 스케일의 ${getDegreeName(degree)}은?`,
          correctAnswer: tones[i],
          description: `${label}: ${tones.map((t, j) => `${j + 1}음=${t}`).join(', ')}`,
          difficulty: scale.type === 'Major' ? 1 : 2,
          sortOrder: order++,
          notation: { notes: assignOctaves(tones), mode: 'sequential' },
        });
      }
    }
  }

  return topics;
}

function generateNoteNameTopics(): TopicData[] {
  const topics: TopicData[] = [];
  let order = 0;

  for (const sf of getSolfege()) {
    const note = solfegeToNote(sf);
    topics.push({
      id: `notename_solfege_${sf}`,
      category: TopicCategory.NoteName,
      displayName: `계이름 ${sf}`,
      question: `계이름 '${sf}'에 해당하는 음이름은?`,
      correctAnswer: note,
      description: `계이름 ${sf} = 음이름 ${note}`,
      difficulty: 1,
      sortOrder: order++,
      notation: { notes: [`${note}4`], mode: 'sequential' },
    });
  }

  for (const root of NATURAL_ROOTS) {
    const sf = noteToSolfege(root);
    topics.push({
      id: `notename_to_solfege_${root}`,
      category: TopicCategory.NoteName,
      displayName: `음이름 ${root}`,
      question: `음이름 '${root}'에 해당하는 계이름은?`,
      correctAnswer: sf,
      description: `음이름 ${root} = 계이름 ${sf}`,
      difficulty: 1,
      sortOrder: order++,
      notation: { notes: [`${root}4`], mode: 'sequential' },
    });
  }

  const enharmonicPairs = [
    ['C#', 'Db'], ['D#', 'Eb'], ['F#', 'Gb'], ['G#', 'Ab'], ['A#', 'Bb'],
  ];
  for (const [sharp, flat] of enharmonicPairs) {
    topics.push({
      id: `notename_enharmonic_${sharp}`,
      category: TopicCategory.NoteName,
      displayName: `${sharp}의 이명동음`,
      question: `${sharp}의 이명동음은?`,
      correctAnswer: flat,
      description: `${sharp} = ${flat} (이명동음: 같은 음, 다른 이름)`,
      difficulty: 2,
      sortOrder: order++,
      notation: { notes: [`${sharp}4`], mode: 'sequential' },
    });
    topics.push({
      id: `notename_enharmonic_${flat}`,
      category: TopicCategory.NoteName,
      displayName: `${flat}의 이명동음`,
      question: `${flat}의 이명동음은?`,
      correctAnswer: sharp,
      description: `${flat} = ${sharp} (이명동음: 같은 음, 다른 이름)`,
      difficulty: 2,
      sortOrder: order++,
      notation: { notes: [`${flat}4`], mode: 'sequential' },
    });
  }

  return topics;
}

export const TOPICS: TopicData[] = [
  ...generateIntervalTopics(),
  ...generateChordTopics(),
  ...generateScaleTopics(),
  ...generateChordToneTopics(),
  ...generateScaleToneTopics(),
  ...generateNoteNameTopics(),
];

export function getTopicsByCategory(category: TopicCategory): TopicData[] {
  return TOPICS.filter((t) => t.category === category);
}

export function getTopicById(id: string): TopicData | undefined {
  return TOPICS.find((t) => t.id === id);
}
