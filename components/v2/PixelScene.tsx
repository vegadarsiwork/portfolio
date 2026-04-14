'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getInterpolatedPreset,
  getMoonPhase,
  Y_RATIOS,
} from './time-presets';

// Constant horizontal pixel density across viewports.
const W = 480;
const HORIZON_RATIO = 0.5;
const ARC_HEIGHT_RATIO = 0.85;

interface Star {
  x: number;
  y: number;
  brightness: number;
  phase: number;
  large: boolean;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  colorIndex: number;
}

interface Building {
  x: number;
  w: number;
  h: number;
  roof: 'flat' | 'antenna' | 'pyramid' | 'double';
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2D(a: number, b: number, seed: number) {
  const value = Math.sin(a * 12.9898 + b * 78.233 + seed * 37.719) * 43758.5453;
  return value - Math.floor(value);
}

// ─── Sun & moon — Minecraft-style arc ─────────────────────────────────────

function getSunPos(hour: number, H: number, HORIZON: number): { x: number; y: number } | null {
  if (hour < 5 || hour > 19) return null;
  const t = (hour - 5) / 14;
  const arcHeight = HORIZON * ARC_HEIGHT_RATIO;
  return {
    x: -25 + t * (W + 50),
    y: HORIZON - Math.sin(t * Math.PI) * arcHeight,
  };
}

function getMoonPos(hour: number, H: number, HORIZON: number): { x: number; y: number } | null {
  let h = hour;
  if (h < 12) h += 24;
  if (h < 17 || h > 31) return null;
  const t = (h - 17) / 14;
  const arcHeight = HORIZON * (ARC_HEIGHT_RATIO - 0.05);
  return {
    x: -25 + t * (W + 50),
    y: HORIZON - Math.sin(t * Math.PI) * arcHeight,
  };
}

/** Stars in the hero scene fade with daylight. */
function getHeroStarVisibility(hour: number): number {
  if (hour <= 5 || hour >= 20.5) return 1;
  if (hour >= 8 && hour <= 17) return 0;
  if (hour < 8) return Math.max(0, (8 - hour) / 3);
  return Math.max(0, (hour - 17) / 3.5);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function getSkylineLightLevel(hour: number): number {
  const dawnFade = 1 - smoothstep(6.2, 8.4, hour);
  const duskFade = smoothstep(17.2, 19.4, hour);
  return Math.max(dawnFade, duskFade);
}

// ─── Sun pixel art (hard color bands) ─────────────────────────────────────

const SUN_OUTLINE = '#d75a12';
const SUN_BODY = '#ffb52e';
const SUN_INNER = '#ffd85a';
const SUN_CORE = '#fff2a0';
const SUN_BAND_OUTER = SUN_BODY;
const SUN_BAND_MID = SUN_INNER;
const SUN_BAND_INNER = SUN_CORE;
const SUN_HIGHLIGHT = '#fffbe0';

function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  sprite: string[],
  palette: Record<string, string>
) {
  const pixel = Math.max(1, scale);
  const width = sprite[0]?.length ?? 0;
  const height = sprite.length;
  const startX = cx - Math.floor((width * pixel) / 2);
  const startY = cy - Math.floor((height * pixel) / 2);

  for (let y = 0; y < height; y++) {
    const row = sprite[y];
    for (let x = 0; x < width; x++) {
      const key = row[x];
      if (key === '.' || !palette[key]) continue;
      ctx.fillStyle = palette[key];
      ctx.fillRect(startX + x * pixel, startY + y * pixel, pixel, pixel);
    }
  }
}

function drawSun(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number) {
  const spriteScale = Math.max(1, Math.round(r / 5));
  const spriteHaloSize = 10 * spriteScale;
  const spriteHaloAlpha = 0.08 + Math.sin(t * 0.6) * 0.015;

  ctx.fillStyle = `rgba(255, 186, 64, ${spriteHaloAlpha.toFixed(3)})`;
  ctx.fillRect(cx - spriteHaloSize / 2, cy - spriteHaloSize / 2, spriteHaloSize, spriteHaloSize);

  drawPixelSprite(ctx, cx, cy, spriteScale, [
    'AAAAAAAAAA',
    'ABBBBBBBBA',
    'ABCCCCCCBA',
    'ABCDDDDCBA',
    'ABCDDDDCBA',
    'ABCDDDDCBA',
    'ABCDDDDCBA',
    'ABCCCCCCBA',
    'ABBBBBBBBA',
    'AAAAAAAAAA',
  ], {
    A: SUN_OUTLINE,
    B: SUN_BODY,
    C: SUN_INNER,
    D: SUN_CORE,
  });

  return;

  // 4 short rays at compass points (drawn first, behind body)
  ctx.fillStyle = SUN_BAND_OUTER;
  // Top
  ctx.fillRect(cx, cy - r - 3, 1, 2);
  ctx.fillRect(cx - 1, cy - r - 4, 1, 1);
  ctx.fillRect(cx + 1, cy - r - 4, 1, 1);
  // Bottom
  ctx.fillRect(cx, cy + r + 1, 1, 2);
  // Left
  ctx.fillRect(cx - r - 3, cy, 2, 1);
  ctx.fillRect(cx - r - 4, cy - 1, 1, 1);
  ctx.fillRect(cx - r - 4, cy + 1, 1, 1);
  // Right
  ctx.fillRect(cx + r + 1, cy, 2, 1);
  ctx.fillRect(cx + r + 3, cy - 1, 1, 1);
  ctx.fillRect(cx + r + 3, cy + 1, 1, 1);

  // Soft outer halo (single pulse layer, smaller than before)
  const haloR = r + 6;
  const haloAlpha = 0.18 + Math.sin(t * 0.8) * 0.04;
  for (let dy = -haloR; dy <= haloR; dy++) {
    for (let dx = -haloR; dx <= haloR; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r + 1 && d < haloR) {
        const norm = (d - r - 1) / 5;
        const a = (1 - norm) * haloAlpha;
        ctx.fillStyle = `rgba(255, 130, 40, ${a.toFixed(3)})`;
        ctx.fillRect(cx + dx, cy + dy, 1, 1);
      }
    }
  }

  // Body — hard color bands by distance from center
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r) continue;
      const norm = d / r;
      let color: string;
      if (norm > 0.92) color = SUN_OUTLINE;
      else if (norm > 0.7) color = SUN_BAND_OUTER;
      else if (norm > 0.45) color = SUN_BAND_MID;
      else if (norm > 0.18) color = SUN_BAND_INNER;
      else color = SUN_CORE;
      ctx.fillStyle = color;
      ctx.fillRect(cx + dx, cy + dy, 1, 1);
    }
  }

  // Highlight cluster — small bright patch upper-left
  const hx = cx - Math.round(r * 0.35);
  const hy = cy - Math.round(r * 0.4);
  ctx.fillStyle = SUN_HIGHLIGHT;
  ctx.fillRect(hx, hy, 1, 1);
  ctx.fillRect(hx + 1, hy, 1, 1);
  ctx.fillRect(hx, hy + 1, 1, 1);
}

// ─── Moon pixel art (phase-based lighting) ────────────────────────────────

const MOON_OUTLINE = '#5a4a70';
const MOON_SQUARE_OUTLINE = '#4b4660';
const MOON_SQUARE_LIGHT = '#efe7cf';
const MOON_SQUARE_MID = '#c3b79d';
const MOON_SQUARE_DARK = '#7b718a';
const MOON_SQUARE_CRATER = '#8d7d68';
const MOON_BODY = '#e8dcc0';
const MOON_BODY_EDGE = '#a89880';
const MOON_HIGHLIGHT = '#fff5d8';
const MOON_CRATER = '#9c8568';
// Dim silhouette colors for the unlit (Earthshine) side — visible but dark.
const MOON_DARK_BODY = '#15121f';
const MOON_DARK_EDGE = '#0a0814';
const MOON_DARK_CRATER = '#08060f';

function isMoonPixelLit(dx: number, dy: number, r: number, phase: number): boolean {
  if (dx * dx + dy * dy > r * r) return false;
  const R = Math.sqrt(r * r - dy * dy);
  const termX = R * Math.cos(2 * Math.PI * phase);
  return phase < 0.5 ? dx > termX : dx < -termX;
}

function drawMoon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, phase: number) {
  const spriteScale = Math.max(1, Math.round(r / 5));
  const spriteHaloSize = 10 * spriteScale;

  ctx.fillStyle = 'rgba(220, 212, 190, 0.05)';
  ctx.fillRect(cx - spriteHaloSize / 2, cy - spriteHaloSize / 2, spriteHaloSize, spriteHaloSize);

  const brightSideRight = phase < 0.5;
  const midpoint = 5;

  drawPixelSprite(
    ctx,
    cx,
    cy,
    spriteScale,
    [
      'AAAAAAAAAA',
      'ABBBBBBBBA',
      'ABCMMMCDBA',
      'ABMCCCDDDA',
      'ABCCCCCDDA',
      'ABCCCCCDDA',
      'ABDCCCCMDA',
      'ABDDCCCMDA',
      'ABBBBBBBBA',
      'AAAAAAAAAA',
    ].map((row) =>
      row
        .split('')
        .map((cell, index) => {
          if (cell === 'A' || cell === '.') return cell;
          const lit = brightSideRight ? index >= midpoint : index < midpoint;
          if (!lit) {
            if (cell === 'M') return 'D';
            if (cell === 'C') return 'D';
            if (cell === 'B') return 'B';
          }
          return cell;
        })
        .join('')
    ),
    {
      A: MOON_SQUARE_OUTLINE,
      B: MOON_SQUARE_MID,
      C: MOON_SQUARE_LIGHT,
      D: MOON_SQUARE_DARK,
      M: MOON_SQUARE_CRATER,
    }
  );

  return;

  if (r < 2) return;

  // Soft halo only on lit side
  for (let dy = -r - 2; dy <= r + 2; dy++) {
    for (let dx = -r - 2; dx <= r + 2; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r && d < r + 2) {
        // Only halo where the lit side faces — sample one inset pixel
        const ix = Math.round(dx * (r - 0.5) / d);
        const iy = Math.round(dy * (r - 0.5) / d);
        if (!isMoonPixelLit(ix, iy, r, phase)) continue;
        const a = ((r + 2 - d) / 2) * 0.18;
        ctx.fillStyle = `rgba(232, 220, 192, ${a.toFixed(3)})`;
        ctx.fillRect(cx + dx, cy + dy, 1, 1);
      }
    }
  }

  // Draw the FULL disk so the moon always reads as a complete circle.
  // Lit pixels get the bright cream palette; unlit pixels get a dim slate
  // silhouette (Earthshine effect) so the phase shows as a brightness
  // contrast on a visible round body.
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r) continue;
      const norm = d / r;
      const lit = isMoonPixelLit(dx, dy, r, phase);

      let color: string;
      if (lit) {
        if (norm > 0.9) color = MOON_OUTLINE;
        else if (norm > 0.78) color = MOON_BODY_EDGE;
        else color = MOON_BODY;
      } else {
        if (norm > 0.92) color = MOON_DARK_EDGE;
        else color = MOON_DARK_BODY;
      }

      // Three fixed crater positions — visible on both lit and dark sides
      // (slightly different colors per side so they read on either)
      const cd1 = Math.sqrt((dx + r * 0.2) ** 2 + (dy - r * 0.15) ** 2);
      const cd2 = Math.sqrt((dx - r * 0.25) ** 2 + (dy + r * 0.1) ** 2);
      const cd3 = Math.sqrt((dx + r * 0.05) ** 2 + (dy + r * 0.4) ** 2);
      if (cd1 < r * 0.13 || cd2 < r * 0.1 || cd3 < r * 0.09) {
        color = lit ? MOON_CRATER : MOON_DARK_CRATER;
      }

      // Highlight pixel upper-right of body (only on lit side)
      if (lit && Math.abs(dx - Math.round(r * 0.3)) <= 0.5 && Math.abs(dy - Math.round(-r * 0.4)) <= 0.5) {
        color = MOON_HIGHLIGHT;
      }

      ctx.fillStyle = color;
      ctx.fillRect(cx + dx, cy + dy, 1, 1);
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────

export default function PixelScene({
  hour = 18,
  className = '',
}: {
  hour?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hourRef = useRef(hour);
  const scrollRef = useRef(0);

  // Dynamic canvas dimensions — recompute on viewport resize
  const [H, setH] = useState(270);
  const [viewportW, setViewportW] = useState(1280);
  const HORIZON = Math.round(H * HORIZON_RATIO);

  useEffect(() => {
    function compute() {
      if (typeof window === 'undefined') return;
      const aspect = window.innerWidth / window.innerHeight;
      const newH = Math.round(W / aspect);
      setH(newH);
      setViewportW(window.innerWidth);
    }
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Real lunar phase for the current date — computed once
  const moonPhase = useMemo(() => getMoonPhase(), []);

  useEffect(() => {
    hourRef.current = hour;
  }, [hour]);

  useEffect(() => {
    function onScroll() {
      scrollRef.current = window.scrollY;
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Layout — depends on H so dimensions changes regenerate appropriately
  const layout = useMemo(() => {
    const rand = mulberry32(42);
    const skyHeight = HORIZON;
    const isMobile = viewportW < 768;

    // Stars — distributed in upper sky region
    const starYMax = Math.round(HORIZON * 0.78);
    const stars: Star[] = [];
    for (let i = 0; i < 150; i++) {
      const y = rand() < 0.8
        ? Math.floor(rand() * starYMax * 0.7)
        : Math.floor(rand() * starYMax);
      stars.push({
        x: Math.floor(rand() * W),
        y,
        brightness: rand(),
        phase: rand() * Math.PI * 2,
        large: rand() > 0.93,
      });
    }

    // Clouds — middle sky band
    const cloudYMin = Math.round(HORIZON * 0.45);
    const cloudYRange = Math.round(HORIZON * 0.35);
    const clouds: Cloud[] = [];
    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.floor(rand() * W),
        y: cloudYMin + Math.floor(rand() * cloudYRange),
        width: 28 + Math.floor(rand() * 60),
        colorIndex: Math.floor(rand() * 4),
      });
    }

    // Buildings — back row (distant, taller) + front row (closer, shorter).
    // Both rows cascade the viewport edge-to-edge; the front row sits in
    // front and hides its own horizon behind the back row.
    function generateRow(
      heightRange: [number, number],
      widthRange: [number, number],
      xOffset: number
    ): Building[] {
      const out: Building[] = [];
      const [bMin, bMax] = heightRange;
      const [wMin, wMax] = widthRange;
      let x = xOffset;
      while (x < W + 2) {
        const w = wMin + Math.floor(rand() * (wMax - wMin));
        const h = bMin + Math.floor(rand() * (bMax - bMin));
        const roofPick = rand();
        const roof: Building['roof'] =
          isMobile
            ? roofPick > 0.9 ? 'antenna' : roofPick > 0.78 ? 'pyramid' : 'flat'
            : roofPick > 0.85 ? 'antenna' : roofPick > 0.7 ? 'pyramid' : roofPick > 0.55 ? 'double' : 'flat';
        out.push({ x, w, h, roof });
        x += w; // flush, no gaps
      }
      return out;
    }

    // Mobile portrait stretches the canvas vertically, which turns
    // normal-width buildings into spindly towers. Compensate with WIDER
    // footprints and SHORTER heights so the skyline reads as a squat,
    // continuous city block rather than a row of chimneys.
    const bBackMin = isMobile
      ? Math.max(36, Math.round(H * 0.09))
      : Math.max(14, Math.round(skyHeight * 0.16));
    const bBackMax = isMobile
      ? Math.max(bBackMin + 20, Math.round(H * 0.18))
      : Math.max(bBackMin + 10, Math.round(skyHeight * 0.42));
    const buildingsBack = generateRow(
      [bBackMin, bBackMax],
      isMobile ? [32, 58] : [12, 34],
      -2
    );

    const bFrontMin = isMobile
      ? Math.max(24, Math.round(H * 0.05))
      : Math.max(8, Math.round(skyHeight * 0.08));
    const bFrontMax = isMobile
      ? Math.max(bFrontMin + 14, Math.round(H * 0.11))
      : Math.max(bFrontMin + 6, Math.round(skyHeight * 0.24));
    const buildingsFront = generateRow(
      [bFrontMin, bFrontMax],
      isMobile ? [40, 72] : [16, 40],
      -Math.floor(rand() * 24) - 4
    );

    return { stars, clouds, buildingsBack, buildingsFront };
  }, [HORIZON, viewportW]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;

    const sunRadius = Math.max(10, Math.round(H * 0.067));
    const moonRadius = Math.max(7, Math.round(H * 0.045));

    let raf = 0;
    let last = 0;

    function drawSky(preset: ReturnType<typeof getInterpolatedPreset>) {
      if (!ctx) return;
      let yPrev = 0;
      for (let i = 0; i < Y_RATIOS.length; i++) {
        const yEnd = Math.round(Y_RATIOS[i] * HORIZON);
        ctx.fillStyle = preset.skyColors[i] ?? preset.skyColors[preset.skyColors.length - 1];
        ctx.fillRect(0, yPrev, W, yEnd - yPrev);
        yPrev = yEnd;
      }
      ctx.fillStyle = preset.groundColor;
      ctx.fillRect(0, HORIZON, W, H - HORIZON);
    }

    function drawClouds(preset: ReturnType<typeof getInterpolatedPreset>) {
      if (!ctx) return;
      for (const c of layout.clouds) {
        ctx.fillStyle = preset.cloudColors[c.colorIndex] ?? preset.cloudColors[0];
        ctx.fillRect(c.x, c.y + 2, c.width, 1);
        ctx.fillRect(c.x + 4, c.y + 1, c.width - 8, 1);
        ctx.fillRect(c.x + 10, c.y, c.width - 20, 1);
      }
    }

    function drawStars(t: number, h: number) {
      if (!ctx) return;
      const visibility = getHeroStarVisibility(h);
      if (visibility <= 0.01) return;
      for (const s of layout.stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 1.4 + s.phase);
        const a = (0.25 + s.brightness * 0.7) * tw * visibility;
        if (a < 0.02) continue;
        const tint =
          s.brightness > 0.85
            ? `rgba(255, 210, 150, ${a.toFixed(3)})`
            : s.brightness > 0.55
            ? `rgba(200, 185, 235, ${a.toFixed(3)})`
            : `rgba(175, 200, 240, ${a.toFixed(3)})`;
        ctx.fillStyle = tint;
        if (s.large && a > 0.3) {
          ctx.fillRect(s.x, s.y, 1, 1);
          ctx.fillRect(s.x - 1, s.y, 1, 1);
          ctx.fillRect(s.x + 1, s.y, 1, 1);
          ctx.fillRect(s.x, s.y - 1, 1, 1);
          ctx.fillRect(s.x, s.y + 1, 1, 1);
        } else {
          ctx.fillRect(s.x, s.y, 1, 1);
        }
      }
    }

    function drawSkyline(t: number, h: number) {
      if (!ctx) return;
      const isMobile = viewportW < 768;
      const lightLevel = getSkylineLightLevel(h);
      // Keep the bluish silhouette constant across day and night — only the
      // window lights change with lightLevel. `lightLevel` peaks at dusk/
      // dawn (≈1) and bottoms out at noon/midnight (≈0).
      const backBodyColor = '#0c1426';
      const frontBodyColor = '#050912';
      const darkenStrength = 0.5;
      const minWindowChance = isMobile ? 0.08 : 0.16;
      const maxWindowChance = isMobile ? 0.34 : 0.58;
      const windowChance = minWindowChance + (maxWindowChance - minWindowChance) * lightLevel;
      const windowSpacingY = isMobile ? 4 : 3;
      const windowSpacingX = isMobile ? 3 : 2;

      // Skyline lifts slightly faster than the sky so there's depth between
      // the two. Capped so it doesn't run off the horizon after the hero
      // leaves the viewport.
      const skylineLift = Math.min(Math.round(H * 0.12), Math.round(scrollRef.current * 0.06));

      // Hoisted per-frame constants shared by every building in every row.
      const fadePower = isMobile ? 2.2 : 1.65;
      const densityStart = isMobile ? 0.34 : 0.48;
      const densityRange = isMobile ? 0.66 : 0.52;
      const densityPower = isMobile ? 2.3 : 1.8;
      const activationThreshold = 1 - windowChance;
      const actEdge0 = activationThreshold - 0.14;
      const actEdge1 = activationThreshold + 0.06;
      // Pre-compute darkening color-stop alphas for the eased curve
      // alpha(d) = max(0, ((d-0.14)/0.86)^1.55) * darkenStrength. A handful
      // of stops approximates the curve well and replaces an H-per-building
      // per-row fillRect loop with a single gradient fill.
      const ds = darkenStrength;
      const darkenStops: [number, number][] = [
        [0, 0],
        [0.14, 0],
        [0.3, 0.085 * ds],
        [0.5, 0.262 * ds],
        [0.7, 0.522 * ds],
        [0.85, 0.75 * ds],
        [1, ds],
      ];

      function drawRow(buildings: Building[], bodyColor: string, baselineOffset: number, rowLift: number) {
        if (!ctx) return;
        for (const b of buildings) {
          const topY = HORIZON + baselineOffset - b.h - rowLift;
          const fullHeight = H - topY;

          // Body + darkening as a single gradient fill.
          ctx.fillStyle = bodyColor;
          ctx.fillRect(b.x, topY, b.w, fullHeight);
          const grad = ctx.createLinearGradient(0, topY, 0, H);
          for (const [stop, alpha] of darkenStops) {
            grad.addColorStop(stop, alpha <= 0.001 ? 'rgba(0,0,0,0)' : `rgba(0,0,0,${alpha.toFixed(3)})`);
          }
          ctx.fillStyle = grad;
          ctx.fillRect(b.x, topY, b.w, fullHeight);

          if (b.roof === 'antenna') {
            ctx.fillStyle = bodyColor;
            ctx.fillRect(b.x + Math.floor(b.w / 2), topY - 6, 1, 6);
            ctx.fillRect(b.x + Math.floor(b.w / 2) - 1, topY - 6, 3, 1);
          } else if (b.roof === 'pyramid') {
            ctx.fillStyle = bodyColor;
            for (let dy = 0; dy < Math.min(5, Math.floor(b.w / 2)); dy++) {
              ctx.fillRect(b.x + dy, topY - dy - 1, b.w - dy * 2, 1);
            }
          } else if (b.roof === 'double') {
            ctx.fillStyle = bodyColor;
            ctx.fillRect(b.x + 2, topY - 3, 3, 3);
            ctx.fillRect(b.x + b.w - 5, topY - 3, 3, 3);
          }

          const invH = 1 / Math.max(1, fullHeight);
          for (let wy = 3; wy < fullHeight - 2; wy += windowSpacingY) {
            const depth = wy * invH;
            if (depth >= 1) break;
            const fade = (1 - depth) ** fadePower;
            if (fade <= 0.035) continue;
            const densityFade = depth <= densityStart
              ? 1
              : Math.max(0, (1 - (depth - densityStart) / densityRange) ** densityPower);
            if (densityFade <= 0.02) continue;
            const fadeMul = fade * densityFade;
            const worldY = topY + wy;
            for (let wx = 2; wx < b.w - 1; wx += windowSpacingX) {
              const noise = hash2D(b.x + wx, wy, 11);
              if (noise < actEdge0) continue;
              const activation = noise >= actEdge1 ? 1 : smoothstep(actEdge0, actEdge1, noise);
              if (activation <= 0.03) continue;
              const flicker = 0.6 + 0.4 * Math.sin(t * 2.5 + noise * 11);
              const a = (0.68 + flicker * 0.26) * fadeMul * activation;
              if (a <= 0.04) continue;
              // Blend window tint + alpha from day (pale yellow, half alpha)
              // to night (warm amber, full alpha). `lightLevel` is 1 at
              // night, 0 at noon.
              const wg = Math.round(235 - 35 * lightLevel);
              const wb = Math.round(180 - 70 * lightLevel);
              const winAlpha = a * (0.5 + 0.5 * lightLevel);
              ctx.fillStyle = `rgba(255, ${wg}, ${wb}, ${winAlpha.toFixed(2)})`;
              ctx.fillRect(b.x + wx, worldY, 1, 1);
            }
          }
        }
      }

      drawRow(layout.buildingsBack, backBodyColor, 0, skylineLift);
      drawRow(layout.buildingsFront, frontBodyColor, Math.round(H * 0.22), Math.round(skylineLift * 1.6));
    }

    function draw() {
      if (!ctx) return;
      const t = performance.now() / 1000;
      const h = hourRef.current;
      const preset = getInterpolatedPreset(h);

      drawSky(preset);
      drawStars(t, h);
      drawClouds(preset);

      // Moon first (in case sun and moon overlap, sun should be on top)
      const moonPos = getMoonPos(h, H, HORIZON);
      if (moonPos) {
        drawMoon(ctx, Math.round(moonPos.x), Math.round(moonPos.y), moonRadius, moonPhase);
      }

      const sunPos = getSunPos(h, H, HORIZON);
      if (sunPos) {
        drawSun(ctx, Math.round(sunPos.x), Math.round(sunPos.y), sunRadius, t);
      }

      drawSkyline(t, h);
    }

    function loop(now: number) {
      if (now - last > 16) {
        last = now;
        scrollRef.current = typeof window !== 'undefined' ? window.scrollY : scrollRef.current;
        draw();
      }
      raf = requestAnimationFrame(loop);
    }

    draw();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [layout, H, HORIZON, moonPhase]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        imageRendering: 'pixelated',
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
