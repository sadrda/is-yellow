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
  return hue >= 30 && hue <= 70 && saturation > 0.1 && max > 80 && r >= g * 0.85;
}
