import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  toVexFlowNotes,
  sortForChord,
  getVoiceParams,
  withOctave,
  formatNotesText,
  type Clef,
} from '../../lib/vexflowUtils';

interface StaffNotationProps {
  notes: string[];
  clef?: Clef;
  mode?: 'sequential' | 'stacked';
  showLabels?: boolean;
  width?: number;
  height?: number;
}

// VexFlow는 DOM이 필요하므로 웹에서만 로드
let Vex: typeof import('vexflow') | null = null;
if (Platform.OS === 'web') {
  Vex = require('vexflow');
}

export function StaffNotation({
  notes,
  clef = 'treble',
  mode = 'sequential',
  width: propWidth,
  height: propHeight,
}: StaffNotationProps) {
  if (Platform.OS === 'web' && Vex) {
    return (
      <WebNotation
        notes={notes}
        clef={clef}
        mode={mode}
        width={propWidth}
        height={propHeight}
      />
    );
  }

  return <NativeFallback notes={notes} clef={clef} mode={mode} />;
}

function WebNotation({
  notes,
  clef,
  mode,
  width: propWidth,
  height: propHeight,
}: {
  notes: string[];
  clef: Clef;
  mode: 'sequential' | 'stacked';
  width?: number;
  height?: number;
}) {
  const containerRef = useRef<View>(null);
  const notesKey = notes.join(',');

  const width = propWidth ?? (mode === 'stacked'
    ? 200
    : Math.min(notes.length * 60 + 80, 360));
  const height = propHeight ?? 120;

  useEffect(() => {
    if (!Vex) return;
    const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = Vex;

    const div = containerRef.current as unknown as HTMLDivElement;
    if (!div) return;

    div.innerHTML = '';

    try {
      const renderer = new Renderer(div, Renderer.Backends.SVG);
      renderer.resize(width, height);
      const context = renderer.getContext();

      const staveWidth = width - 20;
      const stave = new Stave(10, 0, staveWidth);
      stave.addClef(clef);
      stave.setContext(context).draw();

      const vexNotes = toVexFlowNotes(notes, clef);
      let staveNotes: InstanceType<typeof StaveNote>[];

      if (mode === 'stacked') {
        const { sorted } = sortForChord(vexNotes);
        const keys = sorted.map((n) => n.key);
        const chord = new StaveNote({ keys, duration: 'w' });
        sorted.forEach((n, i) => {
          if (n.accidental) {
            chord.addModifier(new Accidental(n.accidental), i);
          }
        });
        staveNotes = [chord];
      } else {
        staveNotes = vexNotes.map((vn) => {
          const note = new StaveNote({ keys: [vn.key], duration: 'q' });
          if (vn.accidental) {
            note.addModifier(new Accidental(vn.accidental));
          }
          return note;
        });
      }

      const { numBeats, beatValue } = getVoiceParams(staveNotes.length, mode);
      const voice = new Voice({ numBeats, beatValue });
      voice.addTickables(staveNotes);

      new Formatter().joinVoices([voice]).format([voice], staveWidth - 60);
      voice.draw(context, stave);
    } catch (e) {
      console.warn('VexFlow render error:', e);
    }

    return () => {
      const d = containerRef.current as unknown as HTMLDivElement;
      if (d) d.innerHTML = '';
    };
  }, [notesKey, clef, mode, width, height]);

  return (
    <View
      ref={containerRef}
      style={[styles.container, { width, height }]}
    />
  );
}

function NativeFallback({
  notes,
  clef,
  mode,
}: {
  notes: string[];
  clef: Clef;
  mode: 'sequential' | 'stacked';
}) {
  const notesWithOctave = notes.map((n) => withOctave(n, clef));
  const clefLabel = clef === 'treble' ? 'Treble' : 'Bass';
  const notesText = formatNotesText(notesWithOctave, mode);

  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.clefText}>{clefLabel}</Text>
      <Text style={styles.notesText}>{notesText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 12,
  },
  clefText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  notesText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 1,
  },
});
