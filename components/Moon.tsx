'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { onLenisScroll } from '@/lib/lenis-store';
import { getMoonPhase } from '@/lib/time-presets';
import { PX } from '@/lib/pixel';

// One sprite cell of the moon, in CSS px (10 cells across = 80px).
const CELL = 8;
const SIZE = CELL * 10;
// Scale while it rides the margin between the two scenes.
const MARGIN_SCALE = 0.6;
// The hero sky scrolls at this fraction of the page (PixelScene's PARALLAX).
const PARALLAX = 0.72;
// Content column (max-w-5xl) and its side padding at md+, in CSS px.
const COLUMN = 1024;
const GUTTER = 48;
// Narrowest margin the moon may ride in between the scenes.
const MIN_MARGIN = 110;
// How long the moon takes to drift home after a drag, in ms.
const RETURN_MS = 900;

const COMPLAINTS = [
  'hey! put me back.',
  'i was orbiting.',
  'rude.',
  'that is not my orbit.',
  'i control the tides, you know.',
  'ow. gravity.',
  'fine. going home.',
  'do you mind?',
];
const TAPS = ['hi.', 'that tickles.', 'busy orbiting.', 'boop.'];

type Point = { x: number; y: number };

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
// Overshoots a touch and settles, like something sprung back into place.
const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

/**
 * Where the hero sky puts the moon at this hour, in the hero's CSS px. Mirrors
 * the arc the skyline shader used to draw it on (rises right, sets left).
 */
function heroAnchor(hour: number, width: number, height: number): Point {
  const w = Math.ceil(width / PX);
  const h = Math.ceil(height / PX);
  const horizon = Math.floor(h * 0.86);
  let t = ((hour < 12 ? hour + 24 : hour) - 17) / 14;
  // In daylight the real moon is down; keep it in its night spot instead.
  if (t < 0 || t > 1) t = 0.36;
  const x = Math.min(w - 16, Math.max(16, w + 25 - t * (w + 50)));
  let y = horizon - Math.sin(t * Math.PI) * horizon * 0.86;
  if (w < 160) y = Math.min(y, Math.round(h * 0.2));
  return { x: x * PX, y: y * PX };
}

/** Where the desk scene's sky holds the moon, from that scene's rect. */
function deskAnchor(rect: DOMRect): Point {
  const W = Math.ceil(rect.width / PX);
  const H = Math.ceil(rect.height / PX);
  // Side-by-side layout (see deskScene in lib/scene-shader.ts): above the desk.
  if (W >= 300) return { x: rect.left + (W - 70) * PX, y: rect.top + H * 0.2 * PX };
  // Single column: just above the monitor's top-right corner.
  const dw = Math.min(150, W - 8);
  const right = W * 0.5 + dw * 0.5;
  const mw = Math.min(72, dw - 24);
  const my = H - 54 - 9 - Math.floor(mw * 0.62);
  return { x: rect.left + (right - 16) * PX, y: rect.top + (my - 18) * PX };
}

/**
 * The moon is the one thing that travels the whole page. It starts in the hero
 * sky, drifts down the right-hand margin as you scroll (its height is your
 * progress), and settles into the night sky above the desk. It lights the page
 * around it, and it can be dragged — it complains, then floats back.
 */
export default function Moon({ hour }: { hour: number }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const spriteRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const hourRef = useRef(hour);
  const [line, setLine] = useState<string | null>(null);
  const [bubbleLeft, setBubbleLeft] = useState(true);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{
    active: boolean;
    moved: boolean;
    start: Point;
    offset: Point;
    pos: Point;
    returnFrom: Point | null;
    returnAt: number;
  }>({ active: false, moved: false, start: { x: 0, y: 0 }, offset: { x: 0, y: 0 }, pos: { x: 0, y: 0 }, returnFrom: null, returnAt: 0 });
  const timer = useRef<number | null>(null);

  useEffect(() => {
    hourRef.current = hour;
  }, [hour]);

  const phaseRight = useMemo(() => getMoonPhase() < 0.5, []);

  useEffect(() => {
    let raf = 0;
    let scroll = window.scrollY;
    const offScroll = onLenisScroll((s) => {
      scroll = s;
    });

    // Where the moon belongs right now, from the scroll position alone.
    function home(): { p: Point; scale: number; opacity: number } {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const hero = document.querySelector<HTMLElement>('main > section');
      const contact = document.getElementById('contact');
      const scene = contact?.querySelector<HTMLElement>('[data-scene="desk"]');

      const heroH = hero?.offsetHeight ?? vh;
      const a = heroAnchor(hourRef.current, vw, heroH);
      const A = { x: a.x, y: a.y - scroll * (1 - PARALLAX) };

      const column = Math.min(vw - GUTTER * 2, COLUMN);
      const margin = (vw - column) / 2;
      const roomy = margin >= MIN_MARGIN;
      const contactTop = contact ? contact.getBoundingClientRect().top + scroll : document.documentElement.scrollHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      const heroGone = heroH * 0.85;
      const footStart = Math.max(heroGone + 1, contactTop - vh);
      const q = clamp01((scroll - heroGone) / Math.max(1, footStart - heroGone));
      const M = { x: vw - margin / 2, y: vh * (0.18 + 0.62 * q) };

      const F = scene ? deskAnchor(scene.getBoundingClientRect()) : M;

      const t1 = smooth(scroll / heroGone);
      const t2 = smooth((scroll - footStart) / Math.max(1, max - footStart));
      const p = {
        x: mix(mix(A.x, M.x, t1), F.x, t2),
        y: mix(mix(A.y, M.y, t1), F.y, t2),
      };
      const scale = mix(mix(1, MARGIN_SCALE, t1), 1, t2);
      // No margin to ride in: it waits out the middle of the page off stage.
      const opacity = roomy ? 1 : clamp01(1 - t1 + t2);
      return { p, scale, opacity };
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const wrap = wrapRef.current;
      const sprite = spriteRef.current;
      const glow = glowRef.current;
      if (!wrap || !sprite || !glow) return;
      const h = home();
      const d = drag.current;

      let p = h.p;
      let scale = h.scale;
      if (d.active) {
        p = d.pos;
        scale = 1;
      } else if (d.returnFrom) {
        const t = clamp01((now - d.returnAt) / RETURN_MS);
        const e = easeOutBack(t);
        p = { x: mix(d.returnFrom.x, h.p.x, e), y: mix(d.returnFrom.y, h.p.y, e) };
        scale = mix(1, h.scale, t);
        if (t >= 1) d.returnFrom = null;
      }
      const opacity = d.active || d.returnFrom ? 1 : h.opacity;

      wrap.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
      wrap.style.opacity = opacity.toFixed(3);
      wrap.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      sprite.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      glow.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      glow.style.opacity = opacity.toFixed(3);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      offScroll();
    };
  }, []);

  function say(text: string) {
    setLine(text);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLine(null), 2600);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    e.preventDefault();
    // Capture on the element that has the move/up handlers.
    e.currentTarget.setPointerCapture(e.pointerId);
    const m = new DOMMatrixReadOnly(getComputedStyle(wrap).transform);
    const d = drag.current;
    d.active = true;
    d.moved = false;
    d.returnFrom = null;
    d.start = { x: e.clientX, y: e.clientY };
    d.offset = { x: e.clientX - m.m41, y: e.clientY - m.m42 };
    d.pos = { x: m.m41, y: m.m42 };
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d.active) return;
    if (!d.moved && Math.hypot(e.clientX - d.start.x, e.clientY - d.start.y) > 4) {
      d.moved = true;
      say('whoa—');
    }
    d.pos = { x: e.clientX - d.offset.x, y: e.clientY - d.offset.y };
    setBubbleLeft(d.pos.x > window.innerWidth / 2);
  }

  function onPointerUp() {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    setDragging(false);
    if (d.moved) {
      d.returnFrom = { ...d.pos };
      d.returnAt = performance.now();
      say(COMPLAINTS[Math.floor(Math.random() * COMPLAINTS.length)]);
    } else {
      setBubbleLeft(d.pos.x > window.innerWidth / 2);
      say(TAPS[Math.floor(Math.random() * TAPS.length)]);
    }
  }

  return (
    <>
      {/* Moonlight on the page: sits under the content, over the page colour. */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[5] h-[900px] w-[900px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(196, 206, 240, 0.09) 0%, rgba(184, 200, 232, 0.04) 30%, transparent 62%)',
        }}
      />

      <div ref={wrapRef} className="fixed left-0 top-0 z-[45]" style={{ opacity: 0 }}>
        <div
          ref={spriteRef}
          role="button"
          tabIndex={-1}
          aria-label="The moon. You can drag it."
          title="drag me"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`absolute left-0 top-0 select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ width: SIZE, height: SIZE, touchAction: 'none' }}
        >
          {/* Halo: lights the sky around it, wherever it is. */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(220, 212, 190, 0.16) 0%, rgba(220, 212, 190, 0.05) 35%, transparent 65%)' }}
          />
          <MoonSprite phaseRight={phaseRight} />
        </div>

        {line && (
          <div
            role="status"
            className={`pointer-events-none absolute top-0 -translate-y-1/2 whitespace-nowrap border border-[var(--color-v2-text)]/40 bg-[var(--color-v2-bg)] px-3 py-2 text-sm text-[var(--color-v2-text)] ${
              bubbleLeft ? 'right-[52px]' : 'left-[52px]'
            }`}
          >
            {line}
            {/* Tail, pointing at the moon. */}
            <span
              aria-hidden
              className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-[var(--color-v2-text)]/40 bg-[var(--color-v2-bg)] ${
                bubbleLeft ? '-right-[5px] border-r border-t' : '-left-[5px] border-b border-l'
              }`}
            />
          </div>
        )}
      </div>
    </>
  );
}

/** The 10x10 pixel moon; the unlit half follows the real lunar phase. */
function MoonSprite({ phaseRight }: { phaseRight: boolean }) {
  const cells: { x: number; y: number; c: string }[] = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const ring = Math.min(x, y, 9 - x, 9 - y);
      let c: string;
      if (ring === 0) c = '#4b4660';
      else if (ring === 1) c = '#c3b79d';
      else if (!(phaseRight ? x >= 5 : x < 5)) c = '#7b718a';
      else {
        const crater =
          (y === 2 && x >= 3 && x <= 5) || (y === 3 && x === 2) || (x === 7 && (y === 6 || y === 7)) || (x === 4 && y === 6);
        const shade = (x >= 6 && y <= 3) || (x <= 3 && y >= 6);
        c = crater ? '#8d7d68' : shade ? '#7b718a' : '#efe7cf';
      }
      cells.push({ x, y, c });
    }
  }
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 10 10" shapeRendering="crispEdges" className="relative block" aria-hidden>
      {cells.map(({ x, y, c }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={c} />
      ))}
    </svg>
  );
}
