// Time-of-day presets for the hero pixel scene.
// Each preset stores a 16-color sky gradient (top → horizon) as a plain
// string array. Y positions are stored separately as ratios of the horizon,
// so the same colors can be drawn at any canvas height.

export type TimeOfDay =
  | 'dawn'
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'golden'
  | 'dusk'
  | 'night';

export interface TimePreset {
  label: string;
  /** 16 colors from top of sky to horizon */
  skyColors: string[];
  groundColor: string;
  cloudColors: string[];
  /** Accent color the page uses for highlighted text in this lighting. */
  accentColor: string;
}

/**
 * Sky band Y positions as ratios of HORIZON (0 = top of canvas, 1 = horizon).
 * 16 bands. Drawing code multiplies by the current HORIZON pixel value.
 */
export const Y_RATIOS = [
  0.042, 0.116, 0.189, 0.274, 0.358, 0.442, 0.526, 0.600,
  0.674, 0.737, 0.800, 0.853, 0.895, 0.937, 0.974, 1.000,
];

export const TIME_PRESETS: Record<TimeOfDay, TimePreset> = {
  night: {
    label: 'NIGHT',
    skyColors: [
      '#020206', '#030309', '#04040c', '#050510',
      '#060614', '#070718', '#08081c', '#09091f',
      '#0a0a22', '#0b0a24', '#0c0b26', '#0c0c27',
      '#0d0c28', '#0e0d29', '#0f0d2a', '#100e2b',
    ],
    groundColor: '#010105',
    cloudColors: ['#0a0618', '#0e0922', '#13102a', '#180f2e'],
    // Cool moonlight — distinct from the warm cream text
    accentColor: '#b8c8e8',
  },

  dawn: {
    label: 'DAWN',
    skyColors: [
      '#0d0a20', '#1a1232', '#261a3e', '#362149',
      '#462852', '#572e56', '#6d3650', '#823e48',
      '#984837', '#ae552a', '#c36328', '#d5722a',
      '#e58333', '#ee9442', '#f1a55a', '#f3b878',
    ],
    groundColor: '#0c0818',
    cloudColors: ['#2d1a3a', '#3e2340', '#523042', '#68403e'],
    accentColor: '#ff8870',
  },

  morning: {
    label: 'MORNING',
    skyColors: [
      '#1e4884', '#265290', '#2f5d9c', '#3867a7',
      '#4171b1', '#4a7bba', '#5484c1', '#5e8cc7',
      '#6993cc', '#749ad0', '#7fa0d3', '#8aa6d6',
      '#95acd7', '#9fb1d8', '#a9b5d8', '#b3b9d7',
    ],
    groundColor: '#0d1a2a',
    cloudColors: ['#c9d9e8', '#b8cbe0', '#a7bdd8', '#95afcf'],
    accentColor: '#6bb5ff',
  },

  noon: {
    label: 'NOON',
    skyColors: [
      '#1c63b5', '#246dbe', '#2d78c7', '#3882ce',
      '#448cd4', '#5196d9', '#5e9fdd', '#6ca8e0',
      '#7ab1e3', '#89b8e5', '#97c0e7', '#a5c6e7',
      '#b3cce7', '#c1d1e7', '#cdd5e5', '#d6d8e3',
    ],
    groundColor: '#112138',
    cloudColors: ['#dce8f2', '#cedbe9', '#bccde0', '#a9bfd6'],
    accentColor: '#5cb0ff',
  },

  afternoon: {
    label: 'AFTERNOON',
    skyColors: [
      '#1b3f72', '#245287', '#2f6297', '#3c72a6',
      '#4b82b2', '#5d8ebb', '#6f99c0', '#81a0c2',
      '#94a6c0', '#a8a9ba', '#bbabb0', '#cca89f',
      '#daa08a', '#e49271', '#ea8257', '#ec7040',
    ],
    groundColor: '#0e1b2c',
    cloudColors: ['#d8ac8a', '#c89874', '#b78360', '#a36f4f'],
    accentColor: '#ffaa55',
  },

  golden: {
    label: 'GOLDEN HOUR',
    skyColors: [
      '#050510', '#07071a', '#0b0a25', '#110c33',
      '#180f3f', '#21134a', '#2c1754', '#3a1c5a',
      '#4e2258', '#652852', '#7d2e48', '#99363c',
      '#ba4530', '#dc5a2a', '#ff7c30', '#ffb061',
    ],
    groundColor: '#030308',
    cloudColors: ['#1a0d2d', '#2c123f', '#3d1842', '#56213f'],
    accentColor: '#ff8c42',
  },

  dusk: {
    label: 'DUSK',
    skyColors: [
      '#030308', '#060616', '#0a0820', '#0e0b29',
      '#140e32', '#1a113b', '#211542', '#291944',
      '#321c44', '#3c2040', '#46233a', '#512631',
      '#5c2827', '#682a1d', '#7a2e17', '#8a3412',
    ],
    groundColor: '#020206',
    cloudColors: ['#0e0a1a', '#15102a', '#1c1435', '#251838'],
    accentColor: '#b06ab3',
  },
};

// ─── Continuous interpolation between keyframes ────────────────────────────

interface Keyframe {
  hour: number;
  preset: TimePreset;
}

const KEYFRAMES: Keyframe[] = [
  { hour: 0,    preset: TIME_PRESETS.night },
  { hour: 5.5,  preset: TIME_PRESETS.dawn },
  { hour: 8,    preset: TIME_PRESETS.morning },
  { hour: 12,   preset: TIME_PRESETS.noon },
  { hour: 15.5, preset: TIME_PRESETS.afternoon },
  { hour: 18,   preset: TIME_PRESETS.golden },
  { hour: 19.5, preset: TIME_PRESETS.dusk },
  { hour: 21.5, preset: TIME_PRESETS.night },
  { hour: 24,   preset: TIME_PRESETS.night },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function lerpHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}

function lerpColors(a: string[], b: string[], t: number): string[] {
  return a.map((c, i) => lerpHex(c, b[i] ?? c, t));
}

/**
 * Smoothly interpolate between adjacent keyframes for a given hour (0..24).
 */
export function getInterpolatedPreset(hour: number): TimePreset {
  let h = hour % 24;
  if (h < 0) h += 24;

  let i = 0;
  while (i < KEYFRAMES.length - 1 && KEYFRAMES[i + 1].hour <= h) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1] ?? KEYFRAMES[KEYFRAMES.length - 1];

  const span = b.hour - a.hour;
  const t = span <= 0 ? 0 : (h - a.hour) / span;
  const ts = t * t * (3 - 2 * t);

  return {
    label: t < 0.5 ? a.preset.label : b.preset.label,
    skyColors: lerpColors(a.preset.skyColors, b.preset.skyColors, ts),
    groundColor: lerpHex(a.preset.groundColor, b.preset.groundColor, ts),
    cloudColors: lerpColors(a.preset.cloudColors, b.preset.cloudColors, ts),
    accentColor: lerpHex(a.preset.accentColor, b.preset.accentColor, ts),
  };
}

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7)   return 'dawn';
  if (hour >= 7 && hour < 11)  return 'morning';
  if (hour >= 11 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'golden';
  if (hour >= 19 && hour < 20) return 'dusk';
  return 'night';
}

/**
 * Real lunar phase for a given date. Returns 0..1 where:
 *   0    = new moon
 *   0.25 = first quarter (right half lit)
 *   0.5  = full moon
 *   0.75 = last quarter (left half lit)
 * Synodic period = 29.530588853 days, reference new moon: 2000-01-06 18:14 UTC.
 */
export function getMoonPhase(date: Date = new Date()): number {
  const synodic = 29.530588853;
  const refNewUtc = Date.UTC(2000, 0, 6, 18, 14, 0);
  const days = (date.getTime() - refNewUtc) / 86_400_000;
  let phase = (days % synodic) / synodic;
  if (phase < 0) phase += 1;
  return phase;
}
