import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  return (
    <>
      <TouchableOpacity style={styles.toggle} onPress={() => setVisible((v) => !v)}>
        <Text style={styles.toggleText}>ⓘ</Text>
      </TouchableOpacity>
      {visible && debug && (
        <View style={styles.panel}>
          <Text style={styles.row}>R: {debug.r.toFixed(0)}  G: {debug.g.toFixed(0)}  B: {debug.b.toFixed(0)}</Text>
          <Text style={styles.row}>hue: {debug.hue.toFixed(1)}°  (need 30–70°)</Text>
          <Text style={styles.row}>sat: {debug.saturation.toFixed(2)}  (need &gt;0.1)</Text>
          <Text style={styles.row}>max: {debug.max.toFixed(0)}  (need &gt;80)</Text>
          <Text style={styles.row}>R≥G×0.85: {(debug.r >= debug.g * 0.85).toString()}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  toggle: {
    position: 'absolute',
    top: 20,
    right: 20,
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
    top: 64,
    right: 20,
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
