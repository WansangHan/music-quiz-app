import { generateChoices } from '../src/lib/distractorGenerator';
import { TopicCategory } from '../src/constants/topicCategory';
import { CHOICE_COUNT } from '../src/constants/quiz';

describe('generateChoices', () => {
  // --- basic contract ---

  describe('always returns CHOICE_COUNT choices with correct answer included', () => {
    const cases: [TopicCategory, string, string][] = [
      [TopicCategory.Interval, '장3도', 'C에서 E까지의 음정은?'],
      [TopicCategory.Chord, 'C 메이저', 'C, E, G 구성음의 코드는?'],
      [TopicCategory.Scale, 'C 메이저', 'C D E F G A B의 스케일은?'],
      [TopicCategory.ChordTone, 'E', 'C 메이저 코드의 3음은?'],
      [TopicCategory.ScaleTone, 'B', 'C 메이저 스케일의 7음은?'],
      [TopicCategory.NoteName, 'G', "계이름 '솔'에 해당하는 음이름은?"],
    ];

    it.each(cases)('%s: returns %i choices with correct answer', (category, answer, question) => {
      const result = generateChoices(category, answer, question);
      expect(result.choices).toHaveLength(CHOICE_COUNT);
      expect(result.choices[result.correctIndex]).toBe(answer);
    });
  });

  // --- Interval ---

  describe('Interval category', () => {
    it('only includes interval names as distractors', () => {
      const result = generateChoices(TopicCategory.Interval, '완전5도', 'C에서 G까지의 음정은?');
      for (const c of result.choices) {
        expect(c).toMatch(/[도음]$/);
      }
    });

    it('does not duplicate correct answer', () => {
      for (let i = 0; i < 30; i++) {
        const result = generateChoices(TopicCategory.Interval, '장3도', 'C에서 E까지의 음정은?');
        const count = result.choices.filter((c) => c === '장3도').length;
        expect(count).toBe(1);
      }
    });
  });

  // --- Chord ---

  describe('Chord category', () => {
    it('returns 4 choices for a chord question', () => {
      const result = generateChoices(TopicCategory.Chord, 'C 메이저', 'C, E, G 구성음의 코드는?');
      expect(result.choices).toHaveLength(4);
      expect(result.choices[result.correctIndex]).toBe('C 메이저');
    });

    it('generates distractors with same root note', () => {
      const result = generateChoices(TopicCategory.Chord, 'G 도미넌트 7', 'G, B, D, F 구성음의 코드는?');
      expect(result.choices).toHaveLength(4);
      expect(result.choices[result.correctIndex]).toBe('G 도미넌트 7');
      // All distractors should start with 'G ' since question starts with 'G'
      for (const c of result.choices) {
        expect(c).toMatch(/^G /);
      }
    });

    it('handles question that does not start with a note', () => {
      // Falls back to 'C' root when no note match
      const result = generateChoices(TopicCategory.Chord, 'C 메이저', '구성음의 코드는?');
      expect(result.choices).toHaveLength(4);
      expect(result.choices[result.correctIndex]).toBe('C 메이저');
    });

    it('works for sharp-root chords', () => {
      const result = generateChoices(TopicCategory.Chord, 'F 마이너', 'F, G#, C 구성음의 코드는?');
      expect(result.choices).toHaveLength(4);
      expect(result.choices[result.correctIndex]).toBe('F 마이너');
    });
  });

  // --- Scale ---

  describe('Scale category', () => {
    it('generates scale name distractors', () => {
      const result = generateChoices(TopicCategory.Scale, 'A 내추럴 마이너', 'A B C D E F G의 스케일은?');
      expect(result.choices).toHaveLength(4);
      expect(result.choices[result.correctIndex]).toBe('A 내추럴 마이너');
    });

    it('distractors are other scale labels', () => {
      const result = generateChoices(TopicCategory.Scale, 'C 메이저', 'C D E F G A B의 스케일은?');
      for (const c of result.choices) {
        expect(c).toMatch(/(메이저|내추럴 마이너)$/);
      }
    });
  });

  // --- ChordTone / ScaleTone ---

  describe('ChordTone category', () => {
    it('uses note names as choices', () => {
      const result = generateChoices(TopicCategory.ChordTone, 'E', 'C 메이저 코드의 3음은?');
      for (const c of result.choices) {
        expect(c).toMatch(/^[A-G][#]?$/);
      }
    });
  });

  describe('ScaleTone category', () => {
    it('uses note names as choices', () => {
      const result = generateChoices(TopicCategory.ScaleTone, 'F#', 'D 메이저 스케일의 3음은?');
      expect(result.choices).toHaveLength(4);
      expect(result.choices[result.correctIndex]).toBe('F#');
    });
  });

  // --- NoteName ---

  describe('NoteName category', () => {
    it('handles note-name answer (음이름)', () => {
      const result = generateChoices(TopicCategory.NoteName, 'G', "계이름 '솔'에 해당하는 음이름은?");
      expect(result.choices).toHaveLength(4);
      expect(result.choices[result.correctIndex]).toBe('G');
    });

    it('handles solfege answer (계이름)', () => {
      const result = generateChoices(TopicCategory.NoteName, '솔', "음이름 'G'에 해당하는 계이름은?");
      expect(result.choices).toHaveLength(4);
      expect(result.choices[result.correctIndex]).toBe('솔');
      // All choices should be solfege
      const allSolfege = ['도', '레', '미', '파', '솔', '라', '시'];
      for (const c of result.choices) {
        expect(allSolfege).toContain(c);
      }
    });

    it('handles enharmonic note answers (C#, F# etc.)', () => {
      const result = generateChoices(TopicCategory.NoteName, 'C#', 'Db의 이명동음은?');
      expect(result.choices).toHaveLength(4);
      expect(result.choices[result.correctIndex]).toBe('C#');
    });
  });

  // --- randomization ---

  describe('randomization', () => {
    it('correctIndex varies across multiple calls', () => {
      const indices = new Set<number>();
      for (let i = 0; i < 50; i++) {
        const result = generateChoices(TopicCategory.Interval, '장3도', 'C에서 E까지의 음정은?');
        indices.add(result.correctIndex);
      }
      // Should have at least 2 different positions over 50 runs
      expect(indices.size).toBeGreaterThan(1);
    });
  });
});
