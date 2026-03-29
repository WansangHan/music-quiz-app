import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../../constants/spacing';

interface Props {
  streak: number;
}

export function StreakBadge({ streak }: Props) {
  if (streak === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>&#x1F525;</Text>
      <Text style={styles.text}>{streak}일 연속</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.accent + '1A',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    gap: Spacing.xs,
  },
  icon: {
    fontSize: FontSize.md,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.accentDark,
  },
});
