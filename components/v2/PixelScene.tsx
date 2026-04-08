'use client';

import { useEffect, useMemo, useRef } from 'react';
import { getInterpolatedPreset } from './time-presets';

export type Scene = 'sunset' | 'skyline' | 'mountains';

const W = 480;
const H = 270;
const HORIZON = 190;

// ─── Sun & moon — Minecraft-style arc ─────────────────────────────────────
// Sun is visible 5am→7pm, arcing east→west across the sky.
// Moon is visible 5pm→7am (wrapping midnight), same arc shape on opposite cycle.

const SUN_R = 18;
const MOON_R = 12;
const ARC_HEIGHT = 160;
const ARC_X_START = -25;
const ARC_X_END = W + 25;

const SUN_COLORS = ['#fffce5', '#fff0a8', '#ffd866', '#ffaa3a', '#ff7a18'] as const;
const SUN_HALO_ALPHA = 0.22;

function getSunPos(hour: number): { x: number; y: number } | null {
  // 5am to 7pm
  if (hour < 5 || hour > 19) return null;
  const t = (hour - 5) / 14;
  return {
    x: ARC_X_START + t * (ARC_X_END - ARC_X_START),
    y: HORIZON - Math.sin(t * Math.PI) * ARC_HEIGHT,
  };
}

function getMoonPos(hour: number): { x: number; y: number } | null {
  // 5pm to next day 7am — wrap if hour < 12 (treat as +24 for the math)
  let h = hour;
  if (h < 12) h += 24;
  if (h < 17 || h > 31) return null;
  const t = (h - 17) / 14;
  return {
    x: ARC_X_START + t * (ARC_X_END - ARC_X_START),
    y: HORIZON - Math.sin(t * Math.PI) * (ARC_HEIGHT - 10),
  };
}

/**
 * Hero star visibility ramps from full at night to zero in midday.
 * Smooth fade through dawn/dusk so they appear naturally.
 */
function getHeroStarVisibility(hour: number): number {
  if (hour <= 5 || hour >= 20.5) return 1;
  if (hour >= 8 && hour <= 17) return 0;
  if (hour < 8) return Math.max(0, (8 - hour) / 3);
  return Math.max(0, (hour - 17) / 3.5);
}

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
  windows: { x: number; y: number; on: number }[];
}

interface MountainRange {
  depth: 0 | 1 | 2;
  peaks: { x: number; height: number; snow: boolean }[];
  color: string;
  snowColor: string;
  snowEdge: string;
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

export default function PixelScene({
  scene = 'skyline',
  hour = 18,
  className = '',
}: {
  scene?: Scene;
  hour?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hourRef = useRef(hour);

  useEffect(() => {
    hourRef.current = hour;
  }, [hour]);

  const layout = useMemo(() => {
    const rand = mulberry32(scene === 'sunset' ? 7 : scene === 'skyline' ? 42 : 99);

    const stars: Star[] = [];
    for (let i = 0; i < 150; i++) {
      const y = rand() < 0.8 ? Math.floor(rand() * 110) : Math.floor(rand() * 150);
      stars.push({
        x: Math.floor(rand() * W),
        y,
        brightness: rand(),
        phase: rand() * Math.PI * 2,
        large: rand() > 0.93,
      });
    }

    const clouds: Cloud[] = [];
    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.floor(rand() * W),
        y: 90 + Math.floor(rand() * 60),
        width: 28 + Math.floor(rand() * 60),
        colorIndex: Math.floor(rand() * 4),
      });
    }

    const buildings: Building[] = [];
    if (scene === 'skyline') {
      let x = -2;
      while (x < W + 2) {
        // Chunkier widths
        const w = 12 + Math.floor(rand() * 22);
        // Uniform 25–65 tall — chunky city silhouette without climbing into
        // the wordmark area. Tallest buildings cap at canvas y≈125 which
        // sits well above the bottom-anchored hero text.
        const h = 25 + Math.floor(rand() * 41);
        const roofPick = rand();
        const roof: Building['roof'] =
          roofPick > 0.85 ? 'antenna' : roofPick > 0.7 ? 'pyramid' : roofPick > 0.55 ? 'double' : 'flat';
        const windows: { x: number; y: number; on: number }[] = [];
        // Denser windows — every 3 rows × 2 cols
        for (let wy = 3; wy < h - 2; wy += 3) {
          for (let wx = 2; wx < w - 1; wx += 2) {
            if (rand() > 0.3) windows.push({ x: wx, y: wy, on: rand() });
          }
        }
        buildings.push({ x, w, h, roof, windows });
        // No gaps — buildings sit flush against each other for a real city silhouette
        x += w;
      }
    }

    const ranges: MountainRange[] = [];
    if (scene === 'mountains') {
      const layers: {
        depth: 0 | 1 | 2;
        color: string;
        snowColor: string;
        snowEdge: string;
        heightMin: number;
        heightMax: number;
        spacing: number;
      }[] = [
        { depth: 0, color: '#1d1438', snowColor: '#c4b5d9', snowEdge: '#e8ddef', heightMin: 30, heightMax: 55, spacing: 70 },
        { depth: 1, color: '#120a27', snowColor: '#a693bd', snowEdge: '#d0bcdd', heightMin: 40, heightMax: 75, spacing: 100 },
        { depth: 2, color: '#05030f', snowColor: '#826692', snowEdge: '#a888b8', heightMin: 50, heightMax: 95, spacing: 140 },
      ];
      for (const layer of layers) {
        const peaks: { x: number; height: number; snow: boolean }[] = [];
        let px = -30;
        while (px < W + 30) {
          peaks.push({
            x: px,
            height: layer.heightMin + Math.floor(rand() * (layer.heightMax - layer.heightMin)),
            snow: rand() > 0.35,
          });
          px += layer.spacing * (0.7 + rand() * 0.6);
        }
        ranges.push({ depth: layer.depth, peaks, color: layer.color, snowColor: layer.snowColor, snowEdge: layer.snowEdge });
      }
    }

    return { stars, clouds, buildings, ranges };
  }, [scene]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    let last = 0;

    function drawSky(preset: ReturnType<typeof getInterpolatedPreset>) {
      if (!ctx) return;
      let y = 0;
      for (const band of preset.skyBands) {
        ctx.fillStyle = band.color;
        ctx.fillRect(0, y, W, band.yEnd - y);
        y = band.yEnd;
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

    function drawMoon(cx: number, cy: number) {
      if (!ctx) return;
      const r = MOON_R;
      // Halo
      for (let dy = -r - 3; dy <= r + 3; dy++) {
        for (let dx = -r - 3; dx <= r + 3; dx++) {
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > r && d < r + 3) {
            const a = ((r + 3 - d) / 3) * 0.14;
            ctx.fillStyle = `rgba(232, 220, 192, ${a.toFixed(3)})`;
            ctx.fillRect(cx + dx, cy + dy, 1, 1);
          }
        }
      }
      // Disk + craters
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d <= r) {
            const norm = d / r;
            let color: string;
            if (norm < 0.6) color = '#ece1c8';
            else if (norm < 0.85) color = '#c4b89d';
            else color = '#8e8267';
            const cd1 = Math.sqrt((dx + 2) * (dx + 2) + (dy - 1) * (dy - 1));
            const cd2 = Math.sqrt((dx - 3) * (dx - 3) + (dy + 2) * (dy + 2));
            const cd3 = Math.sqrt((dx + 1) * (dx + 1) + (dy + 3) * (dy + 3));
            if (cd1 < 1.5 || cd2 < 1.5 || cd3 < 1.5) color = '#786a4f';
            ctx.fillStyle = color;
            ctx.fillRect(cx + dx, cy + dy, 1, 1);
          }
        }
      }
    }

    function drawSun(cx: number, cy: number, t: number) {
      if (!ctx) return;
      const r = SUN_R;

      // Outer halo
      for (let dy = -r - 10; dy <= r + 10; dy++) {
        for (let dx = -r - 10; dx <= r + 10; dx++) {
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > r && d < r + 10) {
            const norm = (d - r) / 10;
            const a = (1 - norm) * (1 - norm) * SUN_HALO_ALPHA;
            ctx.fillStyle = `rgba(255, 154, 48, ${a.toFixed(3)})`;
            ctx.fillRect(cx + dx, cy + dy, 1, 1);
          }
        }
      }

      // Sun disk
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d <= r) {
            const norm = d / r;
            let color: string;
            if (norm < 0.25) color = SUN_COLORS[0];
            else if (norm < 0.5) color = SUN_COLORS[1];
            else if (norm < 0.72) color = SUN_COLORS[2];
            else if (norm < 0.9) color = SUN_COLORS[3];
            else color = SUN_COLORS[4];
            ctx.fillStyle = color;
            ctx.fillRect(cx + dx, cy + dy, 1, 1);
          }
        }
      }

      // Subtle ray pulse — only when high in the sky
      if (cy < HORIZON - 60) {
        const rayAlpha = 0.06 + Math.sin(t * 0.6) * 0.025;
        ctx.fillStyle = `rgba(255, 200, 100, ${rayAlpha.toFixed(3)})`;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI;
          for (let k = r + 4; k < r + 26; k += 2) {
            const rx = Math.round(cx + Math.cos(angle) * k);
            const ry = Math.round(cy - Math.abs(Math.sin(angle)) * k);
            if (ry > 0 && ry < HORIZON) ctx.fillRect(rx, ry, 1, 1);
          }
        }
      }
    }

    function drawSkyline(t: number, h: number) {
      if (!ctx) return;
      const isDayish = h > 8 && h < 17;
      const bodyColor = isDayish ? '#0c1426' : '#020208';

      for (const b of layout.buildings) {
        ctx.fillStyle = bodyColor;
        ctx.fillRect(b.x, HORIZON - b.h, b.w, b.h);

        if (b.roof === 'antenna') {
          ctx.fillRect(b.x + Math.floor(b.w / 2), HORIZON - b.h - 6, 1, 6);
          ctx.fillRect(b.x + Math.floor(b.w / 2) - 1, HORIZON - b.h - 6, 3, 1);
        } else if (b.roof === 'pyramid') {
          for (let dy = 0; dy < Math.min(5, Math.floor(b.w / 2)); dy++) {
            ctx.fillRect(b.x + dy, HORIZON - b.h - dy - 1, b.w - dy * 2, 1);
          }
        } else if (b.roof === 'double') {
          ctx.fillRect(b.x + 2, HORIZON - b.h - 3, 3, 3);
          ctx.fillRect(b.x + b.w - 5, HORIZON - b.h - 3, 3, 3);
        }

        const windowChance = isDayish ? 0.2 : 0.6;
        for (const w of b.windows) {
          if (w.on > 1 - windowChance) {
            const flicker = 0.6 + 0.4 * Math.sin(t * 2.5 + w.on * 11);
            const a = 0.7 + flicker * 0.3;
            ctx.fillStyle = isDayish
              ? `rgba(255, 235, 180, ${(a * 0.5).toFixed(2)})`
              : `rgba(255, 200, 110, ${a.toFixed(2)})`;
            ctx.fillRect(b.x + w.x, HORIZON - b.h + w.y, 1, 1);
          }
        }
      }
    }

    function drawMountains() {
      if (!ctx) return;
      const sorted = [...layout.ranges].sort((a, b) => a.depth - b.depth);
      for (const range of sorted) {
        for (const peak of range.peaks) {
          for (let dy = 0; dy < peak.height; dy++) {
            const halfWidth = Math.round((peak.height - dy) * 0.9);
            const y = HORIZON - 1 - dy;
            const cx = peak.x;
            const left = cx - halfWidth;
            const width = halfWidth * 2 + 1;

            const snowStart = peak.height - 6;
            if (peak.snow && dy > snowStart) {
              ctx.fillStyle = range.snowColor;
              ctx.fillRect(left, y, width, 1);
              if (dy === snowStart + 1) {
                ctx.fillStyle = range.snowEdge;
                ctx.fillRect(left, y, 1, 1);
                ctx.fillRect(left + width - 1, y, 1, 1);
              }
            } else {
              ctx.fillStyle = range.color;
              ctx.fillRect(left, y, width, 1);
              if (halfWidth > 1 && range.depth < 2) {
                ctx.fillStyle = '#2a1a3d';
                ctx.fillRect(left, y, 1, 1);
              }
            }
          }
        }
      }
    }

    function draw() {
      const t = performance.now() / 1000;
      const h = hourRef.current;
      const preset = getInterpolatedPreset(h);

      drawSky(preset);
      drawStars(t, h);
      drawClouds(preset);

      // Sun and moon: Minecraft arc, position computed from hour
      const sun = getSunPos(h);
      const moon = getMoonPos(h);
      // Draw moon first so sun overlaps it during dawn/dusk overlap window
      if (moon) drawMoon(Math.round(moon.x), Math.round(moon.y));
      if (sun) drawSun(Math.round(sun.x), Math.round(sun.y), t);

      if (scene === 'skyline') drawSkyline(t, h);
      else if (scene === 'mountains') drawMountains();
    }

    function loop(now: number) {
      if (now - last > 33) {
        last = now;
        draw();
      }
      raf = requestAnimationFrame(loop);
    }

    draw();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scene, layout]);

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
