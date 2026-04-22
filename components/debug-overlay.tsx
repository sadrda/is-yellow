import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YELLOW } from '@/utils/yellow-detection';

export interface DebugInfo {
  r: number;
  g: number;
  b: number;
  hue: number;
  saturation: number;
  max: number;
}

export function DebugOverlay({ debug }: { debug: DebugInfo | null }) {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <TouchableOpacity style={[styles.toggle, { top: insets.top + 8, right: insets.right + 20 }]} onPress={() => setVisible((v) => !v)}>
        <Text style={styles.toggleText}>ⓘ</Text>
      </TouchableOpacity>
      {visible && debug && (
        <View style={[styles.panel, { top: insets.top + 52, right: insets.right + 20 }]}>
          <Text style={styles.row}>R: {debug.r.toFixed(0)}  G: {debug.g.toFixed(0)}  B: {debug.b.toFixed(0)}</Text>
          <Text style={styles.row}>hue: {debug.hue.toFixed(1)}°  (need {YELLOW.hueMin}–{YELLOW.hueMax}°)</Text>
          <Text style={styles.row}>sat: {debug.saturation.toFixed(2)}  (need &gt;{YELLOW.satMin})</Text>
          <Text style={styles.row}>max: {debug.max.toFixed(0)}  (need &gt;{YELLOW.maxMin})</Text>
          <Text style={styles.row}>R≥G×{YELLOW.rGRatio}: {(debug.r >= debug.g * YELLOW.rGRatio).toString()}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  toggle: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    color: 'white',
    fontSize: 20,
  },
  panel: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
    gap: 2,
  },
  row: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
