import { generateChoices } from '../src/lib/distractorGenerator';
import { TopicCategory } from '../src/constants/topicCategory';

describe('generateChoices', () => {
  it('returns 4 choices for interval questions', () => {
    const result = generateChoices(TopicCategory.Interval, '장3도', 'C에서 E까지의 음정은?');
    expect(result.choices.length).toBe(4);
    expect(result.choices[result.correctIndex]).toBe('장3도');
  });

  it('returns 4 choices for chord tone questions', () => {
    const result = generateChoices(TopicCategory.ChordTone, 'E', 'C Major 코드의 3음은?');
    expect(result.choices.length).toBe(4);
    expect(result.choices[result.correctIndex]).toBe('E');
  });

  it('returns 4 choices for scale questions', () => {
    const result = generateChoices(TopicCategory.Scale, 'C 메이저', 'C D E F G A B의 스케일은?');
    expect(result.choices.length).toBe(4);
    expect(result.choices[result.correctIndex]).toBe('C 메이저');
  });

  it('returns 4 choices for note name questions', () => {
    const result = generateChoices(TopicCategory.NoteName, 'G', "계이름 '솔'에 해당하는 음이름은?");
    expect(result.choices.length).toBe(4);
    expect(result.choices[result.correctIndex]).toBe('G');
  });

  it('does not include correct answer as distractor', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateChoices(TopicCategory.Interval, '완전5도', 'C에서 G까지의 음정은?');
      const count = result.choices.filter((c) => c === '완전5도').length;
      expect(count).toBe(1);
    }
  });
});
