import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { MasteryBadge } from '../components/common/MasteryBadge';
import { getTopicById } from '../data/topics';
import { getProgress } from '../db/progressRepository';
import { CATEGORY_LABELS } from '../constants/topicCategory';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../constants/spacing';
import { UserProgress, MasteryLevel } from '../types/progress';
import { TopicData } from '../types/topic';

export function TopicDetailScreen() {
  const route = useRoute<any>();
  const topicId: string = route.params?.topicId ?? '';
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useFocusEffect(
    useCallback(() => {
      const t = getTopicById(topicId);
      setTopic(t ?? null);
      getProgress(topicId).then(setProgress);
    }, [topicId]),
  );

  if (!topic) {
    return (
      <ScreenWrapper>
        <Text style={styles.errorText}>토픽을 찾을 수 없습니다</Text>
      </ScreenWrapper>
    );
  }

  const accuracy = progress && progress.totalReviews > 0
    ? Math.round((progress.totalCorrect / progress.totalReviews) * 100)
    : null;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.categoryLabel, { color: Colors.category[topic.category] }]}>
            {CATEGORY_LABELS[topic.category]}
          </Text>
          <Text style={styles.title}>{topic.displayName}</Text>
          <MasteryBadge level={progress?.masteryLevel ?? MasteryLevel.New} size="md" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>질문</Text>
          <Text style={styles.cardValue}>{topic.question}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>정답</Text>
          <Text style={styles.cardValueHighlight}>{topic.correctAnswer}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>설명</Text>
          <Text style={styles.cardValue}>{topic.description}</Text>
        </View>

        {progress && progress.isUnlocked && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>학습 진도</Text>
            <View style={styles.statsGrid}>
              <StatItem label="총 복습" value={`${progress.totalReviews}회`} />
              <StatItem label="정확도" value={accuracy !== null ? `${accuracy}%` : '-'} />
              <StatItem label="연속 정답" value={`${progress.streak}회`} />
              <StatItem
                label="다음 복습"
                value={progress.nextReviewAt ? new Date(progress.nextReviewAt).toLocaleDateString('ko-KR') : '-'}
              />
            </View>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
  },
  cardValueHighlight: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  statItem: {
    width: '45%',
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
  errorText: {
    fontSize: FontSize.md,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
});
