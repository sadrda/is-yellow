export const YELLOW = {
  hueMin: 40,
  hueMax: 70,
  satMin: 0.2,
  maxMin: 80,
  rGRatio: 0.8,
} as const;

export function rgbToHue(r: number, g: number, b: number): number {
  'worklet';
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / delta + 6) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return h * 60;
}

export function isYellow(r: number, g: number, b: number): boolean {
  'worklet';
  const max = Math.max(r, g, b);
  const saturation = max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
  const hue = rgbToHue(r, g, b);
  return hue >= YELLOW.hueMin && hue <= YELLOW.hueMax && saturation > YELLOW.satMin && max > YELLOW.maxMin && r >= g * YELLOW.rGRatio;
}
