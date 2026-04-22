import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DebugOverlay, type DebugInfo } from '@/components/debug-overlay';
import { isYellow, rgbToHue } from '@/utils/yellow-detection';

export default function HomeScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [yellow, setYellow] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [debug, setDebug] = useState<DebugInfo | null>(null);

  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
        setHasPermission(true);
      })
      .catch(() => setHasPermission(false));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    let rafId: number;

    const analyze = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const cx = Math.floor(video.videoWidth / 2);
          const cy = Math.floor(video.videoHeight / 2);
          const scale = Math.min(video.videoWidth / window.innerWidth, video.videoHeight / window.innerHeight);
          const half = Math.max(1, Math.round(15 * scale));
          const size = half * 2 + 1;
          const { data } = ctx.getImageData(cx - half, cy - half, size, size);

          let totalR = 0, totalG = 0, totalB = 0;
          for (let i = 0; i < data.length; i += 4) {
            totalR += data[i];
            totalG += data[i + 1];
            totalB += data[i + 2];
          }
          const count = data.length / 4;
          const r = totalR / count;
          const g = totalG / count;
          const b = totalB / count;

          const max = Math.max(r, g, b);
          const saturation = max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
          const hue = rgbToHue(r, g, b);

          setDebug({ r, g, b, hue, saturation, max });
          setYellow(isYellow(r, g, b));
        }
      }
      rafId = requestAnimationFrame(analyze);
    };

    rafId = requestAnimationFrame(analyze);
    return () => cancelAnimationFrame(rafId);
  }, [hasPermission]);

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* @ts-ignore – web-only HTML element */}
      <video ref={videoRef} style={videoStyle} playsInline muted />
      {/* @ts-ignore – web-only HTML element */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <View style={styles.sampleBox} />
      <Text style={[styles.label, yellow && styles.yellowText]}>
        {yellow ? 'yellow' : 'not yellow'}
      </Text>
      <DebugOverlay debug={debug} />
    </View>
  );
}

const videoStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
};

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
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
