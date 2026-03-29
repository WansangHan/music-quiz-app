import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { PressableScale } from '../common/PressableScale';
import { Colors } from '../../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../../constants/spacing';

type Status = 'default' | 'correct' | 'wrong' | 'missed';

interface Props {
  label: string;
  status: Status;
  disabled: boolean;
  onPress: () => void;
}

export function ChoiceButton({ label, status, disabled, onPress }: Props) {
  const bgColor = {
    default: Colors.surface,
    correct: Colors.success + '20',
    wrong: Colors.error + '20',
    missed: Colors.surface,
  }[status];

  const borderColor = {
    default: Colors.border,
    correct: Colors.success,
    wrong: Colors.error,
    missed: Colors.border,
  }[status];

  const textColor = {
    default: Colors.text,
    correct: Colors.success,
    wrong: Colors.error,
    missed: Colors.textLight,
  }[status];

  return (
    <PressableScale
      style={[styles.button, { backgroundColor: bgColor, borderColor }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
});
