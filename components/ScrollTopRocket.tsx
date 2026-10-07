'use client';

import { useEffect, useRef, useState } from 'react';
import { lenisScrollTo, onLenisScroll } from '@/lib/lenis-store';

// The Minecraft firework rocket item, pixel for pixel: a pointed red cap, a
// thin red tube wrapped in a white and pale-blue paper stripe, and a curled
// fuse. One letter per pixel, '.' is empty.
const SPRITE = [
  '..a.....',
  '.bcd....',
  'babdd...',
  'aabbe...',
  '.ffe....',
  '.gab....',
  '.aaf....',
  '.agf....',
  '.ggb....',
  '.gab....',
  '.aaf..hh',
  '.ahf.h..',
  '...hh...',
];
const COLORS: Record<string, string> = {
  a: '#b92929',
  b: '#992929',
  c: '#d62a2a',
  d: '#6d1717',
  e: '#841b1b',
  f: '#b2ccd1',
  g: '#f4f4f4',
  h: '#2d1409',
};
const SPRITE_W = 8;
const SPRITE_H = SPRITE.length;
// CSS px per sprite pixel: in the button, and in flight.
const DOCK_SCALE = 2;
const FLY_SCALE = 3;

// Firework star colours, picked two at a time per explosion.
const STAR_COLORS = ['#ff5a4f', '#ffb02e', '#ffe36e', '#7cf06b', '#4fd6ff', '#6c7bff', '#d46bff', '#ff7ad1', '#f5e9d8'];

/** Fired on window to set off the fireworks show (see app/page.tsx). */
export const FIREWORKS_EVENT = 'vega:fireworks';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

type Vec = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; age: number; size: number; color: string; drag: number; gravity: number; twinkle: boolean };
type Launch = { kind: 'launch'; delay: number; t: number; pos: Vec; dir: number; turn: number; wobble: number; wobbleHz: number; phase: number; burstY: number; big: boolean; trailAt: number };
type Arrival = { kind: 'arrive'; delay: number; t: number; from: Vec; ctrl: Vec; to: Vec; duration: number; trailAt: number };
type Flight = Launch | Arrival;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

function makeLaunch(from: Vec, opts: { lean: [number, number]; burstY: number; delay?: number; big?: boolean }): Launch {
  // About half the time on a squiggly path.
  const squiggly = Math.random() < 0.5;
  return {
    kind: 'launch',
    delay: opts.delay ?? 0,
    t: 0,
    pos: { ...from },
    dir: -Math.PI / 2 + rand(opts.lean[0], opts.lean[1]),
    turn: rand(-0.5, 0.5),
    wobble: squiggly ? rand(0.25, 0.6) : 0,
    wobbleHz: rand(1.2, 3),
    phase: rand(0, Math.PI * 2),
    burstY: opts.burstY,
    big: opts.big ?? Math.random() < 0.35,
    trailAt: 0,
  };
}

/** The rocket as an SVG, for the button. */
function RocketIcon() {
  return (
    <svg
      width={SPRITE_W * DOCK_SCALE}
      height={SPRITE_H * DOCK_SCALE}
      viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`}
      shapeRendering="crispEdges"
      aria-hidden
      className="block"
    >
      {SPRITE.flatMap((row, y) =>
        row.split('').map((ch, x) => (ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLORS[ch]} />))
      )}
      {/* The lit fuse. */}
      <rect x={7} y={10} width={1} height={1} fill="#ffe36e" className="fuse-spark" />
    </svg>
  );
}

/**
 * Back-to-top button with a firework rocket in it. Clicking launches the rocket
 * up the screen in a random direction — sometimes straight, sometimes on a
 * squiggly path — until it bursts into a firework, while the page scrolls up.
 * When the button next appears, a new rocket flies in from the right edge at a
 * random height and settles into it.
 *
 * Easter egg: the Konami code, or `/fireworks` in the command bar, sets off a
 * whole show of them.
 */
export default function ScrollTopRocket() {
  const [visible, setVisible] = useState(false);
  const [docked, setDocked] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flights = useRef<Flight[]>([]);
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);
  const last = useRef(0);
  const sprite = useRef<HTMLCanvasElement | null>(null);
  const wasVisible = useRef(false);

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arriving = () => flights.current.some((f) => f.kind === 'arrive');

  useEffect(() => {
    const compute = (scroll: number) => setVisible(scroll > window.innerHeight * 0.6);
    // Defer the initial read so it lands in a callback (not synchronously in
    // the effect body), and keep it in sync with the smoothed Lenis scroll.
    const id = window.setTimeout(() => compute(window.scrollY), 0);
    const off = onLenisScroll(compute);
    return () => {
      window.clearTimeout(id);
      off();
    };
  }, []);

  // The flying rocket is drawn from a small pre-rendered sprite.
  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = SPRITE_W;
    c.height = SPRITE_H;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    SPRITE.forEach((row, y) =>
      row.split('').forEach((ch, x) => {
        if (ch === '.') return;
        ctx.fillStyle = COLORS[ch];
        ctx.fillRect(x, y, 1, 1);
      })
    );
    sprite.current = c;
  }, []);

  function buttonCentre(): Vec {
    const r = buttonRef.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth - 40, y: window.innerHeight - 40 };
  }

  function burst(at: Vec, big: boolean) {
    const [a, b] = [pick(STAR_COLORS), pick(STAR_COLORS)];
    const count = big ? 110 : 70;
    const speed = big ? 340 : 240;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand(-0.08, 0.08);
      const v = speed * rand(0.55, 1);
      particles.current.push({
        x: at.x,
        y: at.y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        life: rand(1.0, 1.7),
        age: 0,
        size: Math.random() < 0.2 ? 4 : 3,
        color: Math.random() < 0.5 ? a : b,
        drag: 2.2,
        gravity: 70,
        twinkle: Math.random() < 0.4,
      });
    }
    // A bright core that pops and fades.
    for (let i = 0; i < 10; i++) {
      particles.current.push({ x: at.x, y: at.y, vx: rand(-40, 40), vy: rand(-40, 40), life: 0.25, age: 0, size: 6, color: '#ffffff', drag: 4, gravity: 0, twinkle: false });
    }
  }

  function spark(at: Vec, back: Vec, strong: boolean) {
    particles.current.push({
      x: at.x + rand(-2, 2),
      y: at.y + rand(-2, 2),
      vx: back.x * rand(40, 110) + rand(-25, 25),
      vy: back.y * rand(40, 110) + rand(-25, 25),
      life: rand(0.3, strong ? 0.75 : 0.45),
      age: 0,
      size: Math.random() < 0.25 ? 3 : 2,
      color: pick(['#ffe36e', '#ffb02e', '#ff7a1a', '#f5e9d8']),
      drag: 1.5,
      gravity: 160,
      twinkle: false,
    });
  }

  /** Advances one flight; returns the rocket to draw, or null once it is done. */
  function step(f: Flight, dt: number, vw: number): { pos: Vec; heading: number } | null {
    if (f.kind === 'launch') {
      f.t += dt;
      // Accelerates off the pad; the heading drifts by its own turn rate.
      const speed = 160 + 1500 * Math.min(1, f.t / 0.9);
      f.dir += f.turn * dt;
      // Heading for a side edge: steer back toward the middle.
      const across = Math.cos(f.dir);
      if ((f.pos.x > vw - 80 && across > 0) || (f.pos.x < 80 && across < 0)) {
        f.dir += (across > 0 ? -1 : 1) * 3 * dt;
      }
      const heading = f.dir + Math.sin(f.t * f.wobbleHz * Math.PI * 2 + f.phase) * f.wobble;
      f.pos.x += Math.cos(heading) * speed * dt;
      f.pos.y += Math.sin(heading) * speed * dt;
      f.trailAt -= dt;
      if (f.trailAt <= 0) {
        f.trailAt = 0.012;
        spark(f.pos, { x: -Math.cos(heading), y: -Math.sin(heading) }, true);
      }
      if (f.pos.y <= f.burstY || f.pos.y < 24 || f.t > 1.6) {
        burst({ x: Math.min(vw - 24, Math.max(24, f.pos.x)), y: Math.min(window.innerHeight * 0.7, Math.max(24, f.pos.y)) }, f.big);
        return null;
      }
      return { pos: { ...f.pos }, heading };
    }

    f.t += dt;
    const k = Math.min(1, f.t / f.duration);
    const e = 1 - Math.pow(1 - k, 3);
    // The button may have moved (it slides in), so aim at where it is now.
    f.to = buttonCentre();
    const u = 1 - e;
    const pos = {
      x: u * u * f.from.x + 2 * u * e * f.ctrl.x + e * e * f.to.x,
      y: u * u * f.from.y + 2 * u * e * f.ctrl.y + e * e * f.to.y,
    };
    const tan = {
      x: 2 * u * (f.ctrl.x - f.from.x) + 2 * e * (f.to.x - f.ctrl.x),
      y: 2 * u * (f.ctrl.y - f.from.y) + 2 * e * (f.to.y - f.ctrl.y),
    };
    // It turns upright as it slows into the button.
    const flyHeading = Math.atan2(tan.y, tan.x);
    const heading = k < 0.75 ? flyHeading : flyHeading + (-Math.PI / 2 - flyHeading) * ((k - 0.75) / 0.25);
    f.trailAt -= dt;
    if (f.trailAt <= 0 && k < 0.85) {
      f.trailAt = 0.02;
      spark(pos, { x: -Math.cos(flyHeading), y: -Math.sin(flyHeading) }, false);
    }
    if (k >= 1) {
      setDocked(true);
      return null;
    }
    return { pos, heading };
  }

  function frame(now: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dt = Math.min(0.05, (now - (last.current || now)) / 1000);
    last.current = now;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) {
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    ctx.imageSmoothingEnabled = false;

    // Rockets in the air.
    const rockets: { pos: Vec; heading: number }[] = [];
    flights.current = flights.current.filter((f) => {
      if (f.delay > 0) {
        f.delay -= dt;
        return true;
      }
      const r = step(f, dt, vw);
      if (r) rockets.push(r);
      return Boolean(r);
    });

    // Particles.
    particles.current = particles.current.filter((p) => {
      p.age += dt;
      if (p.age >= p.life) return false;
      const drag = Math.exp(-p.drag * dt);
      p.vx *= drag;
      p.vy = p.vy * drag + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const fade = 1 - p.age / p.life;
      ctx.globalAlpha = p.twinkle && Math.random() < 0.35 ? fade * 0.25 : fade;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
      return true;
    });
    ctx.globalAlpha = 1;

    if (sprite.current) {
      for (const r of rockets) {
        ctx.save();
        ctx.translate(Math.round(r.pos.x), Math.round(r.pos.y));
        // The sprite points up; its heading is measured from +x.
        ctx.rotate(r.heading + Math.PI / 2);
        ctx.drawImage(sprite.current, (-SPRITE_W * FLY_SCALE) / 2, (-SPRITE_H * FLY_SCALE) / 2, SPRITE_W * FLY_SCALE, SPRITE_H * FLY_SCALE);
        ctx.restore();
      }
    }

    if (flights.current.length || particles.current.length) {
      raf.current = requestAnimationFrame(frame);
    } else {
      raf.current = 0;
      last.current = 0;
      ctx.clearRect(0, 0, vw, vh);
    }
  }

  function run() {
    if (!raf.current) raf.current = requestAnimationFrame(frame);
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // A new rocket flies in from the right each time the button appears.
  useEffect(() => {
    const appeared = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (!appeared || docked || arriving()) return;
    const id = window.setTimeout(() => {
      if (reduceMotion()) {
        setDocked(true);
        return;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const to = buttonCentre();
      const from = { x: vw + 40, y: rand(vh * 0.2, vh * 0.75) };
      flights.current.push({
        kind: 'arrive',
        delay: 0,
        t: 0,
        from,
        // Swings out over the page and curls back into the corner.
        ctrl: { x: vw - rand(140, Math.min(420, vw * 0.6)), y: (from.y + to.y) / 2 + rand(-160, 160) },
        to,
        duration: rand(0.9, 1.3),
        trailAt: 0,
      });
      run();
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function launch() {
    lenisScrollTo(0);
    if (!docked || reduceMotion()) return;
    const start = buttonCentre();
    const vh = window.innerHeight;
    // Leaning left: the button is in the right-hand corner.
    flights.current.push(makeLaunch({ x: start.x, y: start.y - 10 }, { lean: [-0.65, 0.05], burstY: rand(vh * 0.12, vh * 0.42) }));
    setDocked(false);
    run();
  }

  // The show: a few dozen rockets from along the bottom edge over a few
  // seconds, then a finale of big bursts all at once.
  useEffect(() => {
    function show() {
      if (reduceMotion()) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const count = Math.round(Math.min(36, Math.max(14, vw / 40)));
      for (let i = 0; i < count; i++) {
        flights.current.push(
          makeLaunch(
            { x: rand(vw * 0.06, vw * 0.94), y: vh + 20 },
            { lean: [-0.3, 0.3], burstY: rand(vh * 0.1, vh * 0.5), delay: (i / count) * 3.2 + rand(0, 0.25) }
          )
        );
      }
      for (let i = 0; i < 6; i++) {
        flights.current.push(
          makeLaunch({ x: vw * (0.15 + 0.14 * i), y: vh + 20 }, { lean: [-0.08, 0.08], burstY: rand(vh * 0.15, vh * 0.3), delay: 3.8 + rand(0, 0.15), big: true })
        );
      }
      run();
    }

    let progress = 0;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        show();
      }
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener(FIREWORKS_EVENT, show);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(FIREWORKS_EVENT, show);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Back to top"
        onClick={launch}
        className={`rocket-button group fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center border bg-[var(--color-v2-bg)]/80 backdrop-blur-sm px-step border-[var(--color-v2-muted)]/40 hover:border-[var(--color-v2-orange)] ${
          visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <span className={`rocket-dock block ${docked ? 'rocket-docked' : ''}`}>
          <RocketIcon />
        </span>
      </button>

      {/* Flight layer: rockets in the air, their sparks and the fireworks. */}
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />

      <style jsx global>{`
        /* Empty until a rocket lands; then it drops in with a little bounce. */
        .rocket-dock {
          opacity: 0;
          transform: translateY(-6px);
        }
        .rocket-docked {
          opacity: 1;
          transform: none;
          transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease;
          animation: rocketIdle 2.4s ease-in-out 0.45s infinite;
        }
        .rocket-button:hover .rocket-docked {
          animation-duration: 0.8s;
        }
        @keyframes rocketIdle {
          0%,
          100% {
            translate: 0 1px;
          }
          50% {
            translate: 0 -2px;
          }
        }
        .fuse-spark {
          animation: fuseSpark 0.5s steps(1, end) infinite;
        }
        .rocket-button:hover .fuse-spark {
          animation-duration: 0.18s;
        }
        @keyframes fuseSpark {
          0%,
          49% {
            fill: #ffe36e;
          }
          50%,
          100% {
            fill: #ff7a1a;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rocket-docked,
          .fuse-spark {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
