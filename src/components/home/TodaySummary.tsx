import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../../constants/spacing';

interface Props {
  dueCount: number;
  newCardsRemaining: number;
  studiedToday: number;
}

export function TodaySummary({ dueCount, newCardsRemaining, studiedToday }: Props) {
  return (
    <View style={styles.container}>
      <StatItem label="복습 대기" value={dueCount} color={Colors.accent} />
      <StatItem label="신규 카드" value={newCardsRemaining} color={Colors.primary} />
      <StatItem label="오늘 학습" value={studiedToday} color={Colors.success} />
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
