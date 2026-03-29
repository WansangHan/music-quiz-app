import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { useSettings } from '../hooks/useSettings';
import { TOPICS } from '../data/topics';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../constants/spacing';

export function SettingsScreen() {
  const { settings, setDailyNewLimit, setDefaultDisplay } = useSettings();

  const adjustLimit = (delta: number) => {
    const next = Math.max(1, Math.min(50, settings.dailyNewLimit + delta));
    setDailyNewLimit(next);
  };

  const isNotation = settings.defaultDisplay === 'notation';

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>설정</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>일일 신규 카드 수</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepButton} onPress={() => adjustLimit(-1)}>
              <Ionicons name="remove-circle-outline" size={28} color={Colors.primary} />
            </Pressable>
            <Text style={styles.stepValue}>{settings.dailyNewLimit}</Text>
            <Pressable style={styles.stepButton} onPress={() => adjustLimit(1)}>
              <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
            </Pressable>
          </View>
          <Text style={styles.hint}>하루에 새로 학습할 카드 수 (1~50)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>기본 문제 표시</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleButton, isNotation && styles.toggleActive]}
              onPress={() => setDefaultDisplay('notation')}
            >
              <Ionicons name="musical-notes-outline" size={18} color={isNotation ? '#FFF' : Colors.textSecondary} />
              <Text style={[styles.toggleText, isNotation && styles.toggleTextActive]}>악보</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleButton, !isNotation && styles.toggleActive]}
              onPress={() => setDefaultDisplay('text')}
            >
              <Ionicons name="text-outline" size={18} color={!isNotation ? '#FFF' : Colors.textSecondary} />
              <Text style={[styles.toggleText, !isNotation && styles.toggleTextActive]}>텍스트</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>퀴즈 화면에서 탭하면 전환 가능</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>정보</Text>
          <InfoRow label="버전" value="1.0.0" />
          <InfoRow label="총 토픽" value={`${TOPICS.length}개`} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  stepButton: {
    padding: Spacing.xs,
  },
  stepValue: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 48,
    textAlign: 'center',
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.border,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: '#FFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
});
