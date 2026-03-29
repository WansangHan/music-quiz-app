import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { MasteryDistributionBar } from '../components/common/MasteryDistributionBar';
import { TopicCategory, CATEGORY_LABELS } from '../constants/topicCategory';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../constants/spacing';
import { getAllProgress } from '../db/progressRepository';
import { getTotalStudyDays, getCurrentStreak } from '../db/streakRepository';
import { TOPICS } from '../data/topics';
import { MasteryLevel } from '../types/progress';

interface CategoryStats {
  total: number;
  unlocked: number;
  mastered: number;
  accuracy: number;
}

export function StatisticsScreen() {
  const [distribution, setDistribution] = useState<Record<number, number>>({});
  const [studyDays, setStudyDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [globalAccuracy, setGlobalAccuracy] = useState(0);
  const [categoryStats, setCategoryStats] = useState<Record<TopicCategory, CategoryStats>>({} as any);
  const [weakSpots, setWeakSpots] = useState<{ name: string; accuracy: number }[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, []),
  );

  const loadStats = async () => {
    const [allProgress, days, currentStreak] = await Promise.all([
      getAllProgress(),
      getTotalStudyDays(),
      getCurrentStreak(),
    ]);

    setStudyDays(days);
    setStreak(currentStreak);

    const unlocked = allProgress.filter((p) => p.isUnlocked);

    // Distribution
    const dist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    unlocked.forEach((p) => { dist[p.masteryLevel] = (dist[p.masteryLevel] ?? 0) + 1; });
    setDistribution(dist);

    // Global accuracy
    const totalReviews = allProgress.reduce((a, p) => a + p.totalReviews, 0);
    const totalCorrect = allProgress.reduce((a, p) => a + p.totalCorrect, 0);
    setGlobalAccuracy(totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0);

    // Category stats
    const cats: Record<TopicCategory, CategoryStats> = {} as any;
    for (const cat of Object.values(TopicCategory)) {
      const catTopicIds = TOPICS.filter((t) => t.category === cat).map((t) => t.id);
      const catProgress = allProgress.filter((p) => catTopicIds.includes(p.topicId));
      const catUnlocked = catProgress.filter((p) => p.isUnlocked);
      const catReviews = catProgress.reduce((a, p) => a + p.totalReviews, 0);
      const catCorrect = catProgress.reduce((a, p) => a + p.totalCorrect, 0);
      cats[cat] = {
        total: catTopicIds.length,
        unlocked: catUnlocked.length,
        mastered: catProgress.filter((p) => p.masteryLevel === MasteryLevel.Mastered).length,
        accuracy: catReviews > 0 ? Math.round((catCorrect / catReviews) * 100) : 0,
      };
    }
    setCategoryStats(cats);

    // Weak spots
    const reviewed = allProgress.filter((p) => p.totalReviews > 0);
    const sorted = reviewed
      .map((p) => ({
        name: TOPICS.find((t) => t.id === p.topicId)?.displayName ?? p.topicId,
        accuracy: Math.round((p.totalCorrect / p.totalReviews) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
    setWeakSpots(sorted);
  };

  return (
    <ScreenWrapper noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>통계</Text>

        <View style={styles.overviewRow}>
          <StatBox label="학습 일수" value={`${studyDays}일`} />
          <StatBox label="연속 학습" value={`${streak}일`} />
          <StatBox label="전체 정확도" value={`${globalAccuracy}%`} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>숙련도 분포</Text>
          <MasteryDistributionBar distribution={distribution} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카테고리별</Text>
          {Object.values(TopicCategory).map((cat) => {
            const s = categoryStats[cat];
            if (!s) return null;
            return (
              <View key={cat} style={styles.catRow}>
                <View style={styles.catHeader}>
                  <Text style={[styles.catName, { color: Colors.category[cat] }]}>{CATEGORY_LABELS[cat]}</Text>
                  <Text style={styles.catAccuracy}>{s.accuracy}%</Text>
                </View>
                <Text style={styles.catDetail}>
                  {s.unlocked}/{s.total}개 잠금해제 · {s.mastered}개 숙달
                </Text>
              </View>
            );
          })}
        </View>

        {weakSpots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>약점 TOP 5</Text>
            {weakSpots.map((ws, i) => (
              <View key={i} style={styles.weakRow}>
                <Text style={styles.weakName} numberOfLines={1}>{ws.name}</Text>
                <Text style={[styles.weakAccuracy, ws.accuracy < 50 && { color: Colors.error }]}>
                  {ws.accuracy}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  catRow: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 4,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  catAccuracy: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  catDetail: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  weakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  weakName: {
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  weakAccuracy: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
});
