import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../../constants/spacing';

interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const progress = total > 0 ? Math.min(current / total, 1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${progress * 100}%` as any }]} />
      </View>
      <Text style={styles.text}>{current} / {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
  },
  text: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    minWidth: 44,
    textAlign: 'right',
  },
});
