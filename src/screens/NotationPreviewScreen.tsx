import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Ellipse, G, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../constants/spacing';

// 오선 Y좌표 (5줄: 30, 40, 50, 60, 70)
const STAFF_TOP = 30;
const STAFF_GAP = 10;
const STAFF_LINES = [0, 1, 2, 3, 4].map((i) => STAFF_TOP + i * STAFF_GAP);

// Y좌표 매핑 테이블은 본 구현 시 src/lib/notationLayout.ts로 분리 예정

function Staff({ width = 300 }: { width?: number }) {
  return (
    <G>
      {STAFF_LINES.map((y) => (
        <Line key={y} x1={20} y1={y} x2={width - 20} y2={y} stroke="#CBD5E1" strokeWidth={1} />
      ))}
    </G>
  );
}

function NoteHead({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 ${x} ${y})`} />
      {/* 기둥: 위로 (y<50) 또는 아래로 */}
      {y >= 50 ? (
        <Line x1={x + 7} y1={y} x2={x + 7} y2={y - 32} stroke="#0F172A" strokeWidth={1.8} />
      ) : (
        <Line x1={x - 7} y1={y} x2={x - 7} y2={y + 32} stroke="#0F172A" strokeWidth={1.8} />
      )}
    </G>
  );
}

function LedgerLines({ x, y }: { x: number; y: number }) {
  const lines: number[] = [];
  // 오선 아래 덧줄 (y > 70)
  for (let ly = 80; ly <= y; ly += 10) {
    lines.push(ly);
  }
  // 오선 위 덧줄 (y < 30)
  for (let ly = 20; ly >= y; ly -= 10) {
    lines.push(ly);
  }
  return (
    <G>
      {lines.map((ly) => (
        <Line key={ly} x1={x - 12} y1={ly} x2={x + 12} y2={ly} stroke="#0F172A" strokeWidth={1.2} />
      ))}
    </G>
  );
}

function Sharp({ x, y }: { x: number; y: number }) {
  return <SvgText x={x} y={y + 5} fontSize={14} fontWeight="700" fill="#0F172A">#</SvgText>;
}

function Flat({ x, y }: { x: number; y: number }) {
  return <SvgText x={x} y={y + 4} fontSize={15} fontWeight="700" fill="#0F172A">b</SvgText>;
}

// ===== 프리뷰 카드 =====

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ===== 탭 전환 데모 =====

function ToggleDemo() {
  const [showNotation, setShowNotation] = useState(true);

  return (
    <Card title="탭 전환 데모 (악보 ↔ 텍스트)">
      <Pressable onPress={() => setShowNotation(!showNotation)}>
        {showNotation ? (
          <Svg width={260} height={100} viewBox="0 0 260 100">
            <Staff width={260} />
            <LedgerLines x={100} y={80} />
            <NoteHead x={100} y={80} />
            <NoteHead x={160} y={60} />
            <SvgText x={100} y={96} fontSize={10} fill="#94A3B8" textAnchor="middle">C4</SvgText>
            <SvgText x={160} y={96} fontSize={10} fill="#94A3B8" textAnchor="middle">G4</SvgText>
          </Svg>
        ) : (
          <View style={styles.textQuestion}>
            <Text style={styles.textQuestionText}>C4에서 G4까지의 음정은?</Text>
          </View>
        )}
      </Pressable>
      <Text style={styles.hint}>
        {showNotation ? '악보를 탭하면 텍스트로 전환' : '텍스트를 탭하면 악보로 전환'}
      </Text>
      <View style={styles.answerBadge}>
        <Text style={styles.answerText}>완전5도</Text>
      </View>
    </Card>
  );
}

// ===== 메인 =====

export function NotationPreviewScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Custom SVG 악보 프리뷰</Text>
        <Text style={styles.subtitle}>react-native-svg로 그린 음악 표기법</Text>

        {/* 1. 단일 음표 */}
        <Card title="1. 단일 음표 (높은음자리표)">
          <Svg width={200} height={100} viewBox="0 0 200 100">
            <Staff width={200} />
            <NoteHead x={110} y={35} />
            <SvgText x={110} y={96} fontSize={10} fill="#6366F1" textAnchor="middle" fontWeight="600">E5</SvgText>
          </Svg>
        </Card>

        {/* 2. 음정 */}
        <Card title="2. 음정 — C4에서 E4">
          <Svg width={260} height={100} viewBox="0 0 260 100">
            <Staff width={260} />
            <LedgerLines x={100} y={80} />
            <NoteHead x={100} y={80} />
            <NoteHead x={165} y={70} />
            <SvgText x={100} y={96} fontSize={10} fill="#6366F1" textAnchor="middle" fontWeight="600">C4</SvgText>
            <SvgText x={165} y={96} fontSize={10} fill="#6366F1" textAnchor="middle" fontWeight="600">E4</SvgText>
          </Svg>
          <Text style={styles.answer}>장3도 (Major 3rd)</Text>
        </Card>

        {/* 3. 코드 (C Major) */}
        <Card title="3. 코드 — C Major">
          <Svg width={200} height={100} viewBox="0 0 200 100">
            <Staff width={200} />
            <LedgerLines x={105} y={80} />
            <Ellipse cx={105} cy={80} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 105 80)`} />
            <Ellipse cx={105} cy={70} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 105 70)`} />
            <Ellipse cx={105} cy={60} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 105 60)`} />
            <Line x1={112} y1={60} x2={112} y2={28} stroke="#0F172A" strokeWidth={1.8} />
            <SvgText x={105} y={96} fontSize={10} fill="#6366F1" textAnchor="middle" fontWeight="600">C, E, G</SvgText>
          </Svg>
        </Card>

        {/* 4. 7th 코드 (G7) */}
        <Card title="4. 7th 코드 — G Dominant 7">
          <Svg width={200} height={100} viewBox="0 0 200 100">
            <Staff width={200} />
            <Ellipse cx={105} cy={60} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 105 60)`} />
            <Ellipse cx={105} cy={50} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 105 50)`} />
            <Ellipse cx={105} cy={40} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 105 40)`} />
            <Ellipse cx={105} cy={30} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 105 30)`} />
            <Line x1={98} y1={60} x2={98} y2={90} stroke="#0F172A" strokeWidth={1.8} />
            <SvgText x={105} y={96} fontSize={10} fill="#6366F1" textAnchor="middle" fontWeight="600">G, B, D, F</SvgText>
          </Svg>
        </Card>

        {/* 5. 스케일 (C Major) */}
        <Card title="5. 스케일 — C Major">
          <Svg width={340} height={100} viewBox="0 0 340 100">
            <Staff width={340} />
            <LedgerLines x={65} y={80} />
            {[
              { x: 65, y: 80, label: 'C' },
              { x: 105, y: 75, label: 'D' },
              { x: 145, y: 70, label: 'E' },
              { x: 185, y: 65, label: 'F' },
              { x: 225, y: 60, label: 'G' },
              { x: 265, y: 55, label: 'A' },
              { x: 305, y: 50, label: 'B' },
            ].map(({ x, y, label }) => (
              <G key={label}>
                <NoteHead x={x} y={y} />
                <SvgText x={x} y={96} fontSize={9} fill="#94A3B8" textAnchor="middle">{label}</SvgText>
              </G>
            ))}
          </Svg>
        </Card>

        {/* 6. 임시표 */}
        <Card title="6. 임시표 — F# Major 코드">
          <Svg width={200} height={100} viewBox="0 0 200 100">
            <Staff width={200} />
            <Sharp x={88} y={65} />
            <Ellipse cx={105} cy={65} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 105 65)`} />
            <Sharp x={88} y={55} />
            <Ellipse cx={105} cy={55} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 105 55)`} />
            <Sharp x={88} y={45} />
            <Ellipse cx={105} cy={45} rx={7} ry={5} fill="#0F172A" transform={`rotate(-15 105 45)`} />
            <Line x1={112} y1={45} x2={112} y2={15} stroke="#0F172A" strokeWidth={1.8} />
            <SvgText x={105} y={96} fontSize={10} fill="#6366F1" textAnchor="middle" fontWeight="600">F#, A#, C#</SvgText>
          </Svg>
        </Card>

        {/* 7. 조표 */}
        <Card title="7. 조표 — G Major (F# 1개)">
          <Svg width={220} height={90} viewBox="0 0 220 90">
            <Staff width={220} />
            <Sharp x={58} y={30} />
          </Svg>
          <Text style={styles.answer}>G Major / E Minor</Text>
        </Card>

        {/* 8. 플랫 조표 */}
        <Card title="8. 조표 — F Major (Bb 1개)">
          <Svg width={220} height={90} viewBox="0 0 220 90">
            <Staff width={220} />
            <Flat x={60} y={50} />
          </Svg>
          <Text style={styles.answer}>F Major / D Minor</Text>
        </Card>

        {/* 9. 낮은음자리표 */}
        <Card title="9. 낮은음자리표">
          <Svg width={200} height={100} viewBox="0 0 200 100">
            <Staff width={200} />
            <NoteHead x={110} y={55} />
            <SvgText x={110} y={96} fontSize={10} fill="#6366F1" textAnchor="middle" fontWeight="600">C3</SvgText>
          </Svg>
          <Text style={styles.hint}>낮은음자리표 기호는 폰트 글리프로 표시</Text>
        </Card>

        {/* 10. 탭 전환 */}
        <ToggleDemo />

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, gap: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary, alignSelf: 'flex-start' },
  answer: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  hint: { fontSize: FontSize.xs, color: Colors.textLight, textAlign: 'center' },
  textQuestion: { padding: Spacing.lg, alignItems: 'center' },
  textQuestionText: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  answerBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  answerText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
});
