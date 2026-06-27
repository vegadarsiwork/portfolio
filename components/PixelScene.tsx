'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getInterpolatedPreset,
  getMoonPhase,
  Y_RATIOS,
} from '@/lib/time-presets';
import { onLenisScroll } from '@/lib/lenis-store';

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

// ─── Sun & moon — retro day/night arc ─────────────────────────────────────

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

}

// ─── Moon pixel art (phase-based lighting) ────────────────────────────────

const MOON_SQUARE_OUTLINE = '#4b4660';
const MOON_SQUARE_LIGHT = '#efe7cf';
const MOON_SQUARE_MID = '#c3b79d';
const MOON_SQUARE_DARK = '#7b718a';
const MOON_SQUARE_CRATER = '#8d7d68';

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

}

// ─── Component ────────────────────────────────────────────────────────────

export default function PixelScene({
  hour = 18,
  targetFps = 30,
  reduceMotion = false,
  className = '',
}: {
  hour?: number;
  targetFps?: number;
  reduceMotion?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hourRef = useRef(hour);
  const visibleRef = useRef(true);
  // Latest Lenis scroll value — drives the front skyline's faster parallax.
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

  // Track scroll so the front skyline can parallax faster than the back. The
  // canvas as a whole is already translated by Hero's wrapper; this adds an
  // extra per-frame lift to just the front row for inter-skyline depth.
  useEffect(() => {
    if (reduceMotion) return;
    return onLenisScroll((s) => {
      scrollRef.current = s;
    });
  }, [reduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = Boolean(entry?.isIntersecting);
      },
      { rootMargin: '20% 0px' }
    );
    observer.observe(canvas);
    return () => observer.disconnect();
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
  }, [H, HORIZON, viewportW]);

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
    const frameMs = 1000 / Math.max(1, reduceMotion ? Math.min(targetFps, 8) : targetFps);

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

      // Inter-skyline parallax. The whole canvas is translated by Hero's
      // wrapper (≈0.72× scroll). On top of that we lift the FRONT row a little
      // faster than the BACK row as you scroll, so the two skylines separate and
      // the front one reads as closer. Lift is in canvas px (= screen px / the
      // canvas's display scale), capped to one viewport so it stops once the
      // hero is gone. Note: this steps in low-res canvas pixels — intentional
      // for the pixel aesthetic, but it won't be perfectly subpixel-smooth.
      const displayScale = viewportW > 0 ? viewportW / W : 1;
      const viewportH = typeof window !== 'undefined' ? window.innerHeight : H;
      const cappedScroll = reduceMotion ? 0 : Math.min(scrollRef.current, viewportH);
      const backLift = Math.round((cappedScroll * 0.04) / displayScale);
      const frontLift = Math.round((cappedScroll * 0.14) / displayScale);

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
              // Most windows burn steady; only a sparse subset pulses, slowly,
              // so the skyline reads calm instead of shimmering pixel-by-pixel.
              const pulses = hash2D(b.x + wx, wy, 29) > 0.82;
              const flicker = pulses ? 0.7 + 0.3 * Math.sin(t * 0.8 + noise * 40) : 1;
              const a = (0.7 + flicker * 0.24) * fadeMul * activation;
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

      // Both rows are permanent — drawn at full opacity, no reveal fade-in.
      // Back lifts slowly, front lifts faster → the skylines parallax apart.
      drawRow(layout.buildingsBack, backBodyColor, 0, backLift);
      drawRow(layout.buildingsFront, frontBodyColor, Math.round(H * 0.22), frontLift);
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
      if (!visibleRef.current) {
        raf = requestAnimationFrame(loop);
        return;
      }
      // 60fps cap (lower for reduced-motion). The skyline content animates
      // slowly, so 60 is plenty and keeps the main thread free for the
      // native-rate cursor + scroll. Animation is real-time based.
      if (now - last >= (reduceMotion ? frameMs : 1000 / 60)) {
        last = now;
        draw();
      }
      raf = requestAnimationFrame(loop);
    }

    draw();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [layout, H, HORIZON, moonPhase, reduceMotion, targetFps, viewportW]);

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
