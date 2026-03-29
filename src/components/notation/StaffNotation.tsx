import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Ellipse, G, Text as SvgText } from 'react-native-svg';
import {
  STAFF,
  getNotesPositions,
  withOctave,
  stemDirection,
  getChordOffsets,
  Clef,
} from '../../lib/notationLayout';

interface StaffNotationProps {
  notes: string[];        // ['C4', 'E4', 'G4'] or ['C', 'E', 'G']
  clef?: Clef;
  mode?: 'sequential' | 'stacked'; // 스케일 vs 코드
  showLabels?: boolean;
  width?: number;
  height?: number;
}

const NOTE_RX = 7;
const NOTE_RY = 5;
const STEM_LENGTH = 30;
const STAFF_COLOR = '#CBD5E1';
const NOTE_COLOR = '#0F172A';
const LABEL_COLOR = '#6366F1';
const ACCIDENTAL_COLOR = '#0F172A';

function StaffLines({ x1, x2 }: { x1: number; x2: number }) {
  return (
    <G>
      {STAFF.LINES.map((y) => (
        <Line key={y} x1={x1} y1={y} x2={x2} y2={y} stroke={STAFF_COLOR} strokeWidth={1} />
      ))}
    </G>
  );
}

function LedgerLines({ x, lines }: { x: number; lines: number[] }) {
  return (
    <G>
      {lines.map((y) => (
        <Line key={y} x1={x - 12} y1={y} x2={x + 12} y2={y} stroke={NOTE_COLOR} strokeWidth={1.2} />
      ))}
    </G>
  );
}

function Accidental({ x, y, type }: { x: number; y: number; type: '#' | 'b' }) {
  return (
    <SvgText
      x={x}
      y={y + (type === '#' ? 5 : 4)}
      fontSize={type === '#' ? 14 : 15}
      fontWeight="700"
      fill={ACCIDENTAL_COLOR}
    >
      {type}
    </SvgText>
  );
}

function NoteHead({
  x,
  y,
  accidental,
  ledgerLines,
  showStem = true,
}: {
  x: number;
  y: number;
  accidental: '#' | 'b' | null;
  ledgerLines: number[];
  showStem?: boolean;
}) {
  const dir = stemDirection(y);

  return (
    <G>
      <LedgerLines x={x} lines={ledgerLines} />
      {accidental && <Accidental x={x - 14} y={y} type={accidental} />}
      <Ellipse
        cx={x}
        cy={y}
        rx={NOTE_RX}
        ry={NOTE_RY}
        fill={NOTE_COLOR}
        transform={`rotate(-15 ${x} ${y})`}
      />
      {showStem && (
        dir === 'up' ? (
          <Line x1={x + NOTE_RX} y1={y} x2={x + NOTE_RX} y2={y - STEM_LENGTH} stroke={NOTE_COLOR} strokeWidth={1.8} />
        ) : (
          <Line x1={x - NOTE_RX} y1={y} x2={x - NOTE_RX} y2={y + STEM_LENGTH} stroke={NOTE_COLOR} strokeWidth={1.8} />
        )
      )}
    </G>
  );
}

export function StaffNotation({
  notes,
  clef = 'treble',
  mode = 'sequential',
  showLabels = false,
  width: propWidth,
  height: propHeight,
}: StaffNotationProps) {
  const notesWithOctave = notes.map((n) => withOctave(n, clef));

  if (mode === 'stacked') {
    return <StackedNotation notes={notesWithOctave} clef={clef} showLabels={showLabels} width={propWidth} height={propHeight} />;
  }
  return <SequentialNotation notes={notesWithOctave} clef={clef} showLabels={showLabels} width={propWidth} height={propHeight} />;
}

// 코드: 수직으로 쌓기
function StackedNotation({
  notes,
  clef,
  showLabels,
  width: propWidth,
  height: propHeight,
}: {
  notes: string[];
  clef: Clef;
  showLabels: boolean;
  width?: number;
  height?: number;
}) {
  const width = propWidth ?? 160;
  const height = propHeight ?? (showLabels ? 90 : 80);
  const centerX = width / 2 + 10;
  const positions = getNotesPositions(notes, clef);
  const offsets = getChordOffsets(positions);

  // 기둥: 가장 낮은 음에서 가장 높은 음까지
  const ys = positions.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const dir = stemDirection((minY + maxY) / 2);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <StaffLines x1={10} x2={width - 10} />
        {positions.map((pos, i) => (
          <G key={i}>
            <LedgerLines x={centerX + offsets[i]} lines={pos.ledgerLines} />
            {pos.accidental && <Accidental x={centerX + offsets[i] - 14} y={pos.y} type={pos.accidental} />}
            <Ellipse
              cx={centerX + offsets[i]}
              cy={pos.y}
              rx={NOTE_RX}
              ry={NOTE_RY}
              fill={NOTE_COLOR}
              transform={`rotate(-15 ${centerX + offsets[i]} ${pos.y})`}
            />
          </G>
        ))}
        {/* 단일 기둥 */}
        {dir === 'up' ? (
          <Line x1={centerX + NOTE_RX} y1={maxY} x2={centerX + NOTE_RX} y2={minY - STEM_LENGTH} stroke={NOTE_COLOR} strokeWidth={1.8} />
        ) : (
          <Line x1={centerX - NOTE_RX} y1={minY} x2={centerX - NOTE_RX} y2={maxY + STEM_LENGTH} stroke={NOTE_COLOR} strokeWidth={1.8} />
        )}
        {showLabels && (
          <SvgText x={centerX} y={height - 2} fontSize={10} fill={LABEL_COLOR} textAnchor="middle" fontWeight="600">
            {notes.map((n) => n.replace(/\d$/, '')).join(', ')}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

// 스케일/음정: 왼쪽에서 오른쪽으로 나열
function SequentialNotation({
  notes,
  clef,
  showLabels,
  width: propWidth,
  height: propHeight,
}: {
  notes: string[];
  clef: Clef;
  showLabels: boolean;
  width?: number;
  height?: number;
}) {
  const spacing = 40;
  const startX = 40;
  const width = propWidth ?? Math.max(startX + notes.length * spacing + 20, 200);
  const height = propHeight ?? (showLabels ? 90 : 80);
  const positions = getNotesPositions(notes, clef);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <StaffLines x1={10} x2={width - 10} />
        {positions.map((pos, i) => {
          const x = startX + i * spacing;
          return (
            <G key={i}>
              <NoteHead x={x} y={pos.y} accidental={pos.accidental} ledgerLines={pos.ledgerLines} />
              {showLabels && (
                <SvgText x={x} y={height - 2} fontSize={9} fill={LABEL_COLOR} textAnchor="middle">
                  {notes[i].replace(/\d$/, '')}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
