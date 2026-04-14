'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const W = 480;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Building {
  x: number;
  w: number;
  h: number;
  windows: { x: number; y: number; on: number }[];
}

interface BuildingLayer {
  baseY: number;
  buildings: Building[];
  bodyColor: string;
  edgeColor: string;
  edgeColor2: string;
  windowAlpha: number;
}

/**
 * Foreground silhouette layers — fills the gap between the bg skyline
 * (which sits at the horizon) and the bottom of the canvas. Two passes:
 *
 *   midground  — base ~35% down the ground area, tops reach near the bg horizon
 *   foreground — base at canvas bottom, tall buildings overlapping the midground
 *
 * Together they form a continuous depth-layered silhouette so the wordmark
 * area is no longer an empty dark band between two disconnected skylines.
 */
export default function PixelForeground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [H, setH] = useState(270);
  const HORIZON = Math.round(H * 0.5);

  useEffect(() => {
    function compute() {
      if (typeof window === 'undefined') return;
      const aspect = window.innerWidth / window.innerHeight;
      setH(Math.round(W / aspect));
    }
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const layers = useMemo<BuildingLayer[]>(() => {
    const rand = mulberry32(7777);
    const groundHeight = H - HORIZON;

    // ── MIDGROUND ───────────────────────────────────────────────────
    // Slightly lighter body so the silhouette READS against the sky,
    // base sits ~35% down the ground area, tops reach toward the bg horizon.
    const midBuildings: Building[] = [];
    {
      const minH = Math.max(40, Math.round(groundHeight * 0.42));
      const maxH = Math.max(minH + 25, Math.round(groundHeight * 0.62));
      let x = -10;
      while (x < W + 10) {
        const w = 16 + Math.floor(rand() * 26);
        const h = minH + Math.floor(rand() * (maxH - minH));
        const windows: Building['windows'] = [];
        for (let wy = 3; wy < h - 2; wy += 3) {
          for (let wx = 2; wx < w - 1; wx += 2) {
            if (rand() > 0.35) windows.push({ x: wx, y: wy, on: rand() });
          }
        }
        midBuildings.push({ x, w, h, windows });
        x += w;
      }
    }

    // ── FOREGROUND ──────────────────────────────────────────────────
    // Darker, taller, base at canvas bottom. Overlaps the midground for depth.
    const fgBuildings: Building[] = [];
    {
      const minH = Math.max(80, Math.round(groundHeight * 0.55));
      const maxH = Math.max(minH + 50, Math.round(groundHeight * 0.85));
      let x = -10;
      while (x < W + 10) {
        const w = 28 + Math.floor(rand() * 38);
        const h = minH + Math.floor(rand() * (maxH - minH));
        const windows: Building['windows'] = [];
        for (let wy = 5; wy < h - 4; wy += 5) {
          for (let wx = 3; wx < w - 2; wx += 4) {
            if (rand() > 0.5) windows.push({ x: wx, y: wy, on: rand() });
          }
        }
        fgBuildings.push({ x, w, h, windows });
        x += w;
      }
    }

    return [
      {
        baseY: HORIZON + Math.round(groundHeight * 0.38),
        buildings: midBuildings,
        bodyColor: '#190f2e',
        edgeColor: '#2c1d48',
        edgeColor2: '#211538',
        windowAlpha: 0.55,
      },
      {
        baseY: H,
        buildings: fgBuildings,
        bodyColor: '#0c0820',
        edgeColor: '#1d1336',
        edgeColor2: '#140e26',
        windowAlpha: 0.75,
      },
    ];
  }, [H, HORIZON]);

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

    function drawLayer(layer: BuildingLayer, t: number) {
      if (!ctx) return;
      const { baseY, buildings, bodyColor, edgeColor, edgeColor2, windowAlpha } = layer;
      for (const b of buildings) {
        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(b.x, baseY - b.h, b.w, b.h);
        // 2-pixel top edge highlight — sky-tinted, makes the silhouette pop
        ctx.fillStyle = edgeColor;
        ctx.fillRect(b.x, baseY - b.h, b.w, 1);
        ctx.fillStyle = edgeColor2;
        ctx.fillRect(b.x, baseY - b.h + 1, b.w, 1);
        // Lit windows
        for (const w of b.windows) {
          if (w.on > 0.4) {
            const flicker = 0.65 + 0.35 * Math.sin(t * 2.2 + w.on * 11);
            const a = (windowAlpha + w.on * 0.25) * flicker;
            ctx.fillStyle = `rgba(255, 180, 80, ${a.toFixed(2)})`;
            ctx.fillRect(b.x + w.x, baseY - b.h + w.y, 1, 1);
          }
        }
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const t = performance.now() / 1000;
      // Midground first (behind), foreground second (in front)
      for (const layer of layers) drawLayer(layer, t);
    }

    function loop(now: number) {
      if (now - last > 80) {
        last = now;
        draw();
      }
      raf = requestAnimationFrame(loop);
    }

    draw();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [layers, H]);

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
