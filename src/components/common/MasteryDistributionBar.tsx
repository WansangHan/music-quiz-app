import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { MASTERY_LABELS } from '../../constants/quiz';
import { MasteryLevel } from '../../types/progress';
import { FontSize, Spacing, BorderRadius } from '../../constants/spacing';

interface Props {
  distribution: Record<number, number>;
}

export function MasteryDistributionBar({ distribution }: Props) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const levels = [MasteryLevel.New, MasteryLevel.Learning, MasteryLevel.Familiar, MasteryLevel.Proficient, MasteryLevel.Mastered];

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {levels.map((level) => {
          const count = distribution[level] ?? 0;
          if (count === 0) return null;
          const width = `${(count / total) * 100}%`;
          return (
            <View
              key={level}
              style={[styles.segment, { width: width as any, backgroundColor: Colors.mastery[level] }]}
            />
          );
        })}
      </View>
      <View style={styles.legend}>
        {levels.map((level) => {
          const count = distribution[level] ?? 0;
          if (count === 0) return null;
          return (
            <View key={level} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.mastery[level] }]} />
              <Text style={styles.legendText}>{MASTERY_LABELS[level]} {count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  segment: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
