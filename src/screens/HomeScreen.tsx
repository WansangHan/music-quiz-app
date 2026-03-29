import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { PressableScale } from '../components/common/PressableScale';
import { TodaySummary } from '../components/home/TodaySummary';
import { StreakBadge } from '../components/home/StreakBadge';
import { MasteryDistributionBar } from '../components/common/MasteryDistributionBar';
import { useScheduler } from '../hooks/useScheduler';
import { getCurrentStreak } from '../db/streakRepository';
import { getMasteryDistribution } from '../db/progressRepository';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../constants/spacing';
import { Routes } from '../constants/routes';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { dueCount, newCardsRemaining, studiedToday, loading, refresh, buildQuizDeck } = useScheduler();
  const [streak, setStreak] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({});

  useFocusEffect(
    useCallback(() => {
      refresh();
      getCurrentStreak().then(setStreak);
      getMasteryDistribution().then(setDistribution);
    }, [refresh]),
  );

  const startQuiz = async () => {
    const cards = await buildQuizDeck();
    if (cards.length > 0) {
      navigation.navigate(Routes.Quiz, { cards });
    }
  };

  const hasCards = dueCount + newCardsRemaining > 0;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>화성학 퀴즈</Text>

        <StreakBadge streak={streak} />

        <TodaySummary
          dueCount={dueCount}
          newCardsRemaining={newCardsRemaining}
          studiedToday={studiedToday}
        />

        <PressableScale
          style={[styles.startButton, !hasCards && styles.startButtonDisabled]}
          onPress={startQuiz}
          disabled={!hasCards || loading}
        >
          <Text style={styles.startButtonText}>
            {loading ? '로딩 중...' : hasCards ? '학습 시작' : '오늘 학습 완료!'}
          </Text>
        </PressableScale>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>숙련도 분포</Text>
          <MasteryDistributionBar distribution={distribution} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonDisabled: {
    backgroundColor: Colors.textLight,
    shadowOpacity: 0,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
});
