import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuizEngine } from '../hooks/useQuizEngine';
import { ProgressBar } from '../components/quiz/ProgressBar';
import { ChoiceButton } from '../components/quiz/ChoiceButton';
import { PressableScale } from '../components/common/PressableScale';
import { MasteryBadge } from '../components/common/MasteryBadge';
import { QuizState } from '../constants/quizState';
import { CATEGORY_LABELS } from '../constants/topicCategory';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../constants/spacing';
import { QuizCard } from '../types/quiz';

export function QuizScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const cards: QuizCard[] = route.params?.cards ?? [];

  const {
    state,
    currentIndex,
    currentCard,
    selectedIndex,
    totalCards,
    submitAnswer,
    nextCard,
    getSummary,
  } = useQuizEngine(cards);

  if (state === QuizState.Complete) {
    const summary = getSummary();
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeTitle}>학습 완료!</Text>
          <View style={styles.summaryCard}>
            <SummaryRow label="총 문제" value={`${summary.totalCards}개`} />
            <SummaryRow label="정답" value={`${summary.correctCount}개`} color={Colors.success} />
            <SummaryRow label="오답" value={`${summary.wrongCount}개`} color={Colors.error} />
            <SummaryRow
              label="정확도"
              value={`${Math.round(summary.accuracy * 100)}%`}
              color={Colors.primary}
            />
          </View>
          {summary.masteryChanges.length > 0 && (
            <View style={styles.levelUpSection}>
              <Text style={styles.levelUpTitle}>레벨업!</Text>
              {summary.masteryChanges.map((mc, i) => (
                <View key={i} style={styles.levelUpRow}>
                  <Text style={styles.levelUpName} numberOfLines={1}>{mc.topicName}</Text>
                  <View style={styles.levelUpBadges}>
                    <MasteryBadge level={mc.oldLevel} />
                    <Text style={styles.arrow}>→</Text>
                    <MasteryBadge level={mc.newLevel} />
                  </View>
                </View>
              ))}
            </View>
          )}
          <PressableScale style={styles.doneButton} onPress={() => navigation.goBack()}>
            <Text style={styles.doneButtonText}>돌아가기</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCard) return null;

  const isFeedback = state === QuizState.CorrectFeedback || state === QuizState.WrongFeedback;
  const isDisabled = state !== QuizState.ShowingCard;
  const categoryLabel = CATEGORY_LABELS[currentCard.topic.category];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.quizContainer}>
        <ProgressBar current={currentIndex + 1} total={totalCards} />

        <View style={styles.categoryBadge}>
          <Text style={[styles.categoryText, { color: Colors.category[currentCard.topic.category] }]}>
            {categoryLabel}
          </Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentCard.topic.question}</Text>
        </View>

        <View style={styles.choicesContainer}>
          {currentCard.choices.map((choice, index) => {
            let status: 'default' | 'correct' | 'wrong' | 'missed' = 'default';
            if (isFeedback) {
              if (index === currentCard.correctIndex) status = 'correct';
              else if (index === selectedIndex) status = 'wrong';
            }

            return (
              <ChoiceButton
                key={index}
                label={choice}
                status={status}
                disabled={isDisabled}
                onPress={() => submitAnswer(index)}
              />
            );
          })}
        </View>

        {isFeedback && (
          <PressableScale style={styles.nextButton} onPress={nextCard}>
            <Text style={styles.nextButtonText}>다음</Text>
          </PressableScale>
        )}
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  quizContainer: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  categoryBadge: {
    alignSelf: 'center',
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  questionText: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  choicesContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  nextButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  completeContainer: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  completeTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  levelUpSection: {
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  levelUpTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.primary,
  },
  levelUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelUpName: {
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  levelUpBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrow: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
});
