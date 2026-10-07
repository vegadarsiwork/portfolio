'use client';

import { useEffect, useRef } from 'react';
import { PX } from '@/lib/pixel';

export type DiagramKind = 'queue' | 'table' | 'roles' | 'route' | 'agents' | 'geo';

// Every diagram is drawn on a 160x90 stage, centred in the canvas.
const STAGE_W = 160;
const STAGE_H = 90;
const FPS = 8;

const BG = '#0b0c1a';
const DIM = '#23264a';
const LINE = '#4a4770';
const MUTED = '#8a7da0';
const TEXT = '#f5e9d8';
const OK = '#36c2a8';
const WARN = '#ffb061';
const BAD = '#e2522b';

// 3x5 pixel font, rows top to bottom.
const FONT: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010',
  8: '111101111101111', 9: '111101111001110',
  '-': '000000111000000', '>': '100010001010100', '/': '001001010100100',
  '.': '000000000000010', ':': '000010000010000', '+': '000010111010000',
};

/** Thin drawing surface over a 2D context, offset to the stage origin. */
class Stage {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private ox: number,
    private oy: number,
    readonly tint: string
  ) {}

  rect(x: number, y: number, w: number, h: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x) + this.ox, Math.round(y) + this.oy, Math.round(w), Math.round(h));
  }

  box(x: number, y: number, w: number, h: number, color: string, fill: string = BG) {
    this.rect(x, y, w, h, color);
    this.rect(x + 1, y + 1, w - 2, h - 2, fill);
  }

  text(str: string, x: number, y: number, color: string) {
    let cx = x;
    for (const ch of str.toUpperCase()) {
      const glyph = FONT[ch];
      if (glyph) {
        for (let i = 0; i < 15; i++) {
          if (glyph[i] === '1') this.rect(cx + (i % 3), y + Math.floor(i / 3), 1, 1, color);
        }
      }
      cx += 4;
    }
  }

  line(x0: number, y0: number, x1: number, y1: number, color: string, dash = 0) {
    let x = Math.round(x0);
    let y = Math.round(y0);
    const tx = Math.round(x1);
    const ty = Math.round(y1);
    const dx = Math.abs(tx - x);
    const dy = -Math.abs(ty - y);
    const sx = x < tx ? 1 : -1;
    const sy = y < ty ? 1 : -1;
    let err = dx + dy;
    for (let i = 0; ; i++) {
      if (!dash || Math.floor(i / dash) % 2 === 0) this.rect(x, y, 1, 1, color);
      if (x === tx && y === ty) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
  }

  /** Point at fraction q (0..1) along a polyline. */
  along(points: [number, number][], q: number): [number, number] {
    const lengths = points.slice(1).map(([x, y], i) => Math.abs(x - points[i][0]) + Math.abs(y - points[i][1]));
    let d = Math.max(0, Math.min(1, q)) * lengths.reduce((a, b) => a + b, 0);
    for (let i = 0; i < lengths.length; i++) {
      if (d <= lengths[i] || i === lengths.length - 1) {
        const t = lengths[i] ? d / lengths[i] : 0;
        return [
          points[i][0] + (points[i + 1][0] - points[i][0]) * t,
          points[i][1] + (points[i + 1][1] - points[i][1]) * t,
        ];
      }
      d -= lengths[i];
    }
    return points[points.length - 1];
  }

  path(points: [number, number][], color: string, dash = 0) {
    for (let i = 1; i < points.length; i++) {
      this.line(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], color, dash);
    }
  }
}

type Draw = (g: Stage, f: number) => void;

function rand(n: number) {
  const x = Math.sin(n * 127.1 + 11.7) * 43758.5453;
  return x - Math.floor(x);
}

// PulseQueue — jobs leave the queue for three workers; the middle worker
// dies mid-job now and then and the job goes back to the tail to be retried.
const queue: Draw = (g, f) => {
  const cycle = Math.floor(f / 6);
  const step = f % 6;
  const centres = [18, 44, 70];
  const toWorker = (w: number): [number, number][] => [[99, 44], [110, 44], [110, centres[w]], [122, centres[w]]];
  const retryPath: [number, number][] = [[138, 53], [138, 57], [37, 57], [37, 50]];
  const isRetry = (id: number) => id % 9 === 7;

  g.text('QUEUE', 33, 30, MUTED);
  g.box(4, 37, 20, 15, LINE);
  g.text('API', 8, 42, TEXT);
  g.line(24, 44, 31, 44, DIM);
  g.rect(24 + Math.floor((step * 7) / 6), 43, 2, 3, g.tint);
  g.line(110, 18, 110, 70, DIM);
  for (const cy of centres) g.line(110, cy, 122, cy, DIM);
  g.line(99, 44, 110, 44, DIM);
  g.path(retryPath, DIM, 2);

  // Queue: six jobs sliding toward the head on the right.
  g.box(31, 38, 68, 13, LINE);
  for (let i = 0; i < 6; i++) {
    const x = 88 - (i + 1) * 11 + Math.floor(((step + 1) * 11) / 6);
    if (x >= 33) g.rect(x, 40, 9, 9, isRetry(cycle + 1 + i) ? WARN : g.tint);
  }

  // The job that just left the head.
  const [jx, jy] = g.along(toWorker(cycle % 3), (step + 0.5) / 6);
  g.rect(jx - 2, jy - 2, 5, 5, isRetry(cycle) ? WARN : g.tint);

  centres.forEach((cy, w) => {
    const job = w + 3 * Math.floor((cycle - w) / 3);
    const phase = f - 6 * job;
    const busy = job >= 0 && phase >= 6;
    const crashed = busy && job % 9 === 1 && phase >= 12;
    g.box(122, cy - 8, 32, 17, crashed ? BAD : busy ? g.tint : LINE);
    g.text(crashed ? 'DOWN' : `W${w + 1}`, 125, cy - 5, crashed ? BAD : TEXT);
    g.rect(125, cy + 3, 26, 3, DIM);
    if (crashed) {
      const [rx, ry] = g.along(retryPath, (phase - 12 + 0.5) / 6);
      g.rect(rx - 2, ry - 2, 5, 5, WARN);
    } else if (busy) {
      g.rect(125, cy + 3, Math.floor(((phase - 6) / 12) * 26), 3, phase >= 16 ? OK : g.tint);
    }
  });
  g.text('AT-LEAST-ONCE', 4, 82, MUTED);
};

// TrueLend — a Postgres table used as the queue: rows are claimed, then done.
const table: Draw = (g, f) => {
  const scroll = f % 8;
  const base = Math.floor(f / 8);
  g.box(26, 10, 108, 59, LINE);
  g.text('ID', 30, 12, MUTED);
  g.text('STATUS', 52, 12, MUTED);
  g.text('BY', 112, 12, MUTED);
  g.rect(27, 19, 106, 1, LINE);
  for (let r = 0; r < 7; r++) {
    const y = 20 + r * 8 - scroll;
    const id = base + r;
    const centre = y + 4;
    const state = centre < 36 ? 'DONE' : centre < 52 ? 'CLAIMED' : 'PENDING';
    // Rows are clipped to the table body by hand: skip what would spill out.
    if (y < 20 || y + 6 > 68) continue;
    g.text(String(id % 1000).padStart(3, '0'), 30, y + 1, MUTED);
    g.text(state, 52, y + 1, state === 'DONE' ? OK : state === 'CLAIMED' ? WARN : MUTED);
    if (state !== 'PENDING') g.text(`W${(id % 2) + 1}`, 112, y + 1, TEXT);
    g.rect(27, y + 7, 106, 1, DIM);
  }
  g.text('>', 20, 34, g.tint);
  g.text('>', 20, 50, g.tint);
  g.text('CRON', 139, 12, MUTED);
  g.box(143, 20, 8, 8, LINE, scroll < 3 ? g.tint : BG);
  g.text('SKIP LOCKED', 58, 78, MUTED);
};

// Linchpin — three role-scoped views over one database.
const roles: Draw = (g, f) => {
  const xs = [6, 57, 108];
  const names = ['ADMIN', 'CLIENT', 'CREATOR'];
  const active = Math.floor(f / 16) % 3;
  xs.forEach((x, i) => {
    g.box(x, 8, 46, 42, i === active ? g.tint : LINE);
    g.text(names[i], x + 3, 11, i === active ? TEXT : MUTED);
    g.rect(x + 1, 18, 44, 1, DIM);
    g.path([[x + 23, 50], [x + 23, 58], [80, 58], [80, 68]], DIM);
  });
  // Admin: bar chart.
  for (let i = 0; i < 5; i++) {
    const h = 8 + Math.round(8 * (1 + Math.sin(Math.floor(f / 2) * 0.5 + i * 1.3)));
    g.rect(xs[0] + 5 + i * 8, 47 - h, 5, h, g.tint);
  }
  // Client: checklist.
  for (let i = 0; i < 4; i++) {
    const y = 22 + i * 7;
    g.box(xs[1] + 4, y, 4, 4, MUTED, i < Math.floor(f / 8) % 5 ? OK : BG);
    g.rect(xs[1] + 11, y + 1, 28 - i * 4, 2, LINE);
  }
  // Creator: media grid.
  for (let i = 0; i < 6; i++) {
    g.rect(xs[2] + 4 + (i % 3) * 13, 22 + Math.floor(i / 3) * 13, 11, 10, i === Math.floor(f / 5) % 6 ? g.tint : DIM);
  }
  g.box(68, 68, 24, 14, LINE);
  g.text('DB', 77, 73, TEXT);
  const wire: [number, number][] = [[xs[active] + 23, 50], [xs[active] + 23, 58], [80, 58], [80, 68]];
  const q = (f % 16) / 16;
  const [px, py] = g.along(wire, Math.floor(f / 16) % 2 === 0 ? q : 1 - q);
  g.rect(px - 1, py - 1, 3, 3, g.tint);
  g.text('3 ROLES', 4, 82, MUTED);
  g.text('1 SCHEMA', 124, 82, MUTED);
};

// Spice Express — a parcel crossing fare zones while its state machine advances.
const route: Draw = (g, f) => {
  const points: [number, number][] = [[14, 56], [48, 56], [48, 30], [104, 30], [104, 56], [146, 56]];
  const q = Math.min(1, (f % 80) / 60);
  const [x, y] = g.along(points, q);
  const zone = x < 54 ? 0 : x < 108 ? 1 : 2;
  g.rect(54, 0, 54, STAGE_H, '#0f1124');
  g.line(54, 0, 54, 70, DIM, 2);
  g.line(108, 0, 108, 70, DIM, 2);
  ['ZONE A', 'ZONE B', 'ZONE C'].forEach((name, i) => g.text(name, 6 + i * 54, 6, i === zone ? TEXT : MUTED));
  g.path(points, LINE);
  // Travelled part of the route.
  for (let i = 0; i <= 40 * q; i++) {
    const [tx, ty] = g.along(points, i / 40);
    g.rect(tx, ty, 1, 1, g.tint);
  }
  for (const [nx, ny] of points) g.box(nx - 2, ny - 2, 5, 5, MUTED);
  g.rect(x - 3, y - 3, 7, 7, g.tint);
  g.rect(x - 1, y - 3, 1, 7, BG);
  g.text(`FARE ${String(40 + zone * 35).padStart(3, '0')}`, 114, 16, g.tint);

  const states = ['BOOKED', 'PICKED', 'TRANSIT', 'DONE'];
  const current = q < 0.05 ? 0 : q < 0.22 ? 1 : q < 1 ? 2 : 3;
  let tx = 18;
  states.forEach((s, i) => {
    g.text(s, tx, 79, i === current ? (i === 3 ? OK : g.tint) : MUTED);
    tx += s.length * 4;
    if (i < states.length - 1) {
      g.text('>', tx + 2, 79, LINE);
      tx += 8;
    }
  });
};

// Sentinel — a router fans a query out to specialists; one fails, retries, recovers.
const agents: Draw = (g, f) => {
  const names = ['SCOUT', 'RISK', 'ANLST', 'DEBUG', 'WRITE', 'PLAN', 'FACTS', 'LEGAL', 'SUMM'];
  const run = Math.floor(f / 48);
  const phase = f % 48;
  const a0 = Math.floor(rand(run) * 9);
  const a1 = (a0 + 2 + Math.floor(rand(run + 50) * 3)) % 9;
  const a2 = (a1 + 2 + Math.floor(rand(run + 90) * 2)) % 9;
  const picked = [a0, a1, a2];
  const failing = run % 2 === 0 ? a1 : -1;

  names.forEach((_, i) => {
    const cy = 8 + i * 9;
    const on = picked.includes(i);
    g.line(30, 45, 70, cy, on && phase < 28 ? LINE : DIM);
    g.line(92, cy, 126, 45, on && phase >= 28 ? LINE : DIM);
  });
  g.box(6, 39, 24, 13, phase < 10 ? g.tint : LINE);
  g.text('ROUTE', 9, 43, TEXT);
  g.box(126, 39, 28, 13, phase >= 38 ? OK : LINE);
  g.text('MEMO', 133, 43, phase >= 38 ? OK : TEXT);

  names.forEach((name, i) => {
    const y = 5 + i * 9;
    const on = picked.includes(i) && phase >= 10 && phase < 38;
    const retrying = i === failing && phase >= 14 && phase < 20;
    const blink = phase < 28 && phase % 4 < 2;
    g.box(70, y, 22, 7, retrying ? WARN : on ? (blink ? TEXT : g.tint) : LINE);
    g.text(name, 72, y + 1, retrying ? WARN : on ? TEXT : MUTED);
  });

  for (const i of picked) {
    const cy = 8 + i * 9;
    if (phase < 10) {
      const t = phase / 10;
      g.rect(30 + 40 * t - 1, 45 + (cy - 45) * t - 1, 3, 3, g.tint);
    } else if (phase >= 28 && phase < 38) {
      const t = (phase - 28) / 10;
      g.rect(92 + 34 * t - 1, cy + (45 - cy) * t - 1, 3, 3, OK);
    }
  }
};

// Rennowise — a check-in only counts inside the site's geofence.
const geo: Draw = (g, f) => {
  const phase = f % 104;
  const site: [number, number] = [86, 45];
  const radius = 20;
  for (const [x, y, w, h] of [[8, 8, 30, 26], [62, 6, 44, 22], [130, 10, 22, 24], [10, 56, 28, 24], [62, 58, 40, 20], [128, 56, 24, 22]]) {
    g.rect(x, y, w, h, '#101226');
  }
  g.rect(0, 44, STAGE_W, 3, DIM);
  g.rect(49, 0, 3, STAGE_H, DIM);
  g.rect(117, 0, 3, STAGE_H, DIM);

  const granted = phase >= 40 && phase < 56;
  const denied = phase >= 72 && phase < 96;
  for (let i = 0; i < 72; i++) {
    if (!granted && i % 2) continue;
    const a = (i / 72) * Math.PI * 2;
    g.rect(site[0] + Math.cos(a) * radius, site[1] + Math.sin(a) * radius, 1, 1, granted ? OK : g.tint);
  }
  g.box(site[0] - 2, site[1] - 2, 5, 5, g.tint, TEXT);

  // Inspector A walks the road into the fence.
  const ax = 8 + Math.min(1, phase / 40) * 72;
  g.rect(ax - 1, 44, 3, 3, granted ? OK : TEXT);
  g.rect(ax, 41, 1, 3, granted ? OK : TEXT);

  // Inspector B tries from two blocks away.
  if (phase >= 56 && phase < 96) {
    const reach = Math.min(1, (phase - 56) / 16);
    const bx = 138;
    const by = 20;
    g.line(bx, by, bx + (site[0] - bx) * reach, by + (site[1] - by) * reach, denied ? BAD : MUTED, 2);
    g.rect(bx - 1, by - 1, 3, 3, denied ? BAD : TEXT);
    if (denied) {
      g.line(bx - 4, by - 4, bx + 4, by + 4, BAD);
      g.line(bx + 4, by - 4, bx - 4, by + 4, BAD);
    }
  }

  g.text('GEOFENCE', 4, 82, MUTED);
  if (granted) g.text('CHECK-IN OK', 112, 82, OK);
  else if (denied) g.text('DENIED 412M', 112, 82, BAD);
  else g.text('LOCATING...', 112, 82, MUTED);
};

const DIAGRAMS: Record<DiagramKind, Draw> = { queue, table, roles, route, agents, geo };

/**
 * An animated pixel diagram for projects that have no interface to screenshot.
 * It runs at a stepped 8fps only while at least half of it is on screen.
 */
export default function PixelDiagram({ kind, tint, label }: { kind: DiagramKind; tint: string; label: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = document.createElement('canvas');
    const mosaic = document.createElement('canvas');
    const sceneCtx = scene.getContext('2d');
    const mosaicCtx = mosaic.getContext('2d');
    if (!sceneCtx || !mosaicCtx) return;

    let w = STAGE_W;
    let h = STAGE_H;
    let visible = false;
    let active = false;
    const block = 1;
    let frame = 20;
    let raf = 0;
    let last = 0;

    function layout() {
      // The largest whole-pixel scale that fits the stage, capped at the grid unit.
      const scale = Math.max(2, Math.min(PX, Math.floor(wrap!.clientWidth / STAGE_W)));
      w = Math.max(STAGE_W, Math.floor(wrap!.clientWidth / scale));
      h = Math.max(STAGE_H, Math.floor(wrap!.clientHeight / scale));
      for (const c of [canvas!, scene, mosaic]) {
        c.width = w;
        c.height = h;
      }
      canvas!.style.width = `${w * scale}px`;
      canvas!.style.height = `${h * scale}px`;
      paint();
    }

    function paint() {
      sceneCtx!.fillStyle = BG;
      sceneCtx!.fillRect(0, 0, w, h);
      sceneCtx!.fillStyle = DIM;
      for (let y = 4; y < h; y += 8) for (let x = 4; x < w; x += 8) sceneCtx!.fillRect(x, y, 1, 1);
      const stage = new Stage(sceneCtx!, Math.floor((w - STAGE_W) / 2), Math.floor((h - STAGE_H) / 2), tint);
      DIAGRAMS[kind](stage, frame);

      ctx!.imageSmoothingEnabled = false;
      if (block <= 1) {
        ctx!.drawImage(scene, 0, 0);
        return;
      }
      // Mosaic: sample the scene down to coarse blocks, then blow it back up.
      const sw = Math.ceil(w / block);
      const sh = Math.ceil(h / block);
      mosaicCtx!.imageSmoothingEnabled = false;
      mosaicCtx!.drawImage(scene, 0, 0, w, h, 0, 0, sw, sh);
      ctx!.drawImage(mosaic, 0, 0, sw, sh, 0, 0, sw * block, sh * block);
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      frame += 1;
      paint();
    }

    // Active (at least half on screen): run the animation — so only the
    // diagram being looked at moves.
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        const nowActive = visible && entry.intersectionRatio >= 0.5;
        if (nowActive === active) return;
        active = nowActive;
        cancelAnimationFrame(raf);
        if (active && !reduceMotion) raf = requestAnimationFrame(loop);
      },
      { threshold: [0, 0.5] }
    );
    visibility.observe(wrap);
    const resize = new ResizeObserver(layout);
    resize.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      visibility.disconnect();
      resize.disconnect();
    };
  }, [kind, tint]);

  return (
    <div ref={wrapRef} role="img" aria-label={label} className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: BG }}>
      <canvas ref={canvasRef} aria-hidden className="block shrink-0" style={{ imageRendering: 'pixelated' }} />
    </div>
  );
}
