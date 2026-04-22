import { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { runOnJS } from 'react-native-worklets';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameOutput,
  type Frame,
} from 'react-native-vision-camera';
import { DebugOverlay, type DebugInfo } from '@/components/debug-overlay';
import { isYellow, rgbToHue } from '@/utils/yellow-detection';

export default function HomeScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [yellow, setYellow] = useState(false);
  const [debug, setDebug] = useState<DebugInfo | null>(null);

  const { width: screenW, height: screenH } = Dimensions.get('window');

  const onFrame = useCallback(
    (frame: Frame) => {
      'worklet';
      if (!frame.isValid) {
        frame.dispose();
        return;
      }

      const buffer = frame.getPixelBuffer();
      const data = new Uint8Array(buffer);
      const stride = frame.bytesPerRow;
      const cx = Math.floor(frame.width / 2);
      const cy = Math.floor(frame.height / 2);

      const scale = Math.min(frame.width / screenW, frame.height / screenH);
      const half = Math.max(1, Math.round(15 * scale));

      // 'rgb' target format delivers BGRA on iOS, RGBA on Android
      const isBGRA = frame.pixelFormat === 'rgb-bgra-8-bit';
      const isRGB = frame.pixelFormat === 'rgb-rgb-8-bit';
      const bpp = isRGB ? 3 : 4;

      let totalR = 0;
      let totalG = 0;
      let totalB = 0;

      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const i = (cy + dy) * stride + (cx + dx) * bpp;
          if (isBGRA) {
            totalB += data[i];
            totalG += data[i + 1];
            totalR += data[i + 2];
          } else {
            totalR += data[i];
            totalG += data[i + 1];
            totalB += data[i + 2];
          }
        }
      }

      const count = (half * 2 + 1) * (half * 2 + 1);
      const r = totalR / count;
      const g = totalG / count;
      const b = totalB / count;
      const max = Math.max(r, g, b);
      const saturation = max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
      const hue = rgbToHue(r, g, b);

      frame.dispose();
      runOnJS(setYellow)(isYellow(r, g, b));
      runOnJS(setDebug)({ r, g, b, hue, saturation, max });
    },
    [],
  );

  const frameOutput = useFrameOutput({ pixelFormat: 'rgb', onFrame });

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera access is needed</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permButton}>
          <Text style={styles.permButtonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No camera found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        outputs={[frameOutput]}
      />
      <View style={styles.sampleBox} />
      <Text style={[styles.label, yellow && styles.yellowText]}>
        {yellow ? 'yellow' : 'not yellow'}
      </Text>
      <DebugOverlay debug={debug} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleBox: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  label: {
    position: 'absolute',
    top: '60%',
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  yellowText: {
    color: '#FFD700',
  },
  message: {
    color: 'white',
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  permButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  permButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
