'use client';

import { useEffect, useRef, useState } from 'react';
import Section from './Section';
import PixelReveal from './PixelReveal';
import { quests, type Quest } from '@/data/quests';

export default function SideQuests() {
  return (
    <Section
      id="quests"
      index="04"
      label="Side quests"
      title="THE SKETCHBOOK."
      intro="Smaller, looser things. Real repos, a couple of inline toys. Half are demos, half are mistakes I learned from. None of them would survive a code review and that's the point."
    >
      {/* One reveal for the whole grid: the 1px gaps are the grid's own background. */}
      <PixelReveal>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[var(--color-v2-muted)]/20 border border-[var(--color-v2-muted)]/20">
          {quests.map((q) => (
            <QuestCell key={q.title} quest={q} />
          ))}
        </div>
      </PixelReveal>
    </Section>
  );
}

// ── Cell router ────────────────────────────────────────────────────────────

function QuestCell({ quest }: { quest: Quest }) {
  const content =
    quest.kind === 'lab-pixels' ? (
      <PixelHoverLab tint={quest.tint} />
    ) : quest.kind === 'lab-reaction' ? (
      <ReactionLab tint={quest.tint} />
    ) : (
      <StaticTile quest={quest} />
    );

  const baseClass =
    'group relative block h-full aspect-[4/3] overflow-hidden';

  if (quest.href && !quest.kind) {
    return (
      <a
        href={quest.href}
        target="_blank"
        rel="noreferrer"
        className={`${baseClass} cursor-pointer`}
        style={{ backgroundColor: 'var(--color-v2-bg)' }}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={baseClass} style={{ backgroundColor: 'var(--color-v2-bg)' }}>
      {content}
    </div>
  );
}

// ── Static tile (most cells) ───────────────────────────────────────────────

function StaticTile({ quest }: { quest: Quest }) {
  return (
    <>
      <div className="relative z-10 h-full flex flex-col justify-between p-3 md:p-4">
        <div className="meta">
          {quest.tag}
        </div>
        <div>
          <div className="px-step text-base md:text-lg font-medium text-[var(--color-v2-text)] group-hover:text-[var(--color-v2-orange)]">
            {quest.title}
          </div>
          {quest.blurb && (
            <div className="mt-1 text-xs text-[var(--color-v2-text)]/60 leading-snug hidden sm:block">
              {quest.blurb}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Lab 1: pixel hover grid ────────────────────────────────────────────────

function PixelHoverLab({ tint }: { tint: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -999, y: -999, active: false });
  const visibleRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CELL = 8; // logical pixel size
    let raf = 0;
    let last = 0;
    const size = { w: 0, h: 0 };

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      size.w = rect.width;
      size.h = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = Boolean(entry?.isIntersecting);
      },
      { rootMargin: '15% 0px' }
    );
    observer.observe(canvas);

    function draw(now: number) {
      if (!canvas || !ctx) return;
      if (!visibleRef.current || now - last < 1000 / 60) {
        raf = requestAnimationFrame(draw);
        return;
      }
      last = now;
      ctx.clearRect(0, 0, size.w, size.h);
      const cols = Math.ceil(size.w / CELL);
      const rows = Math.ceil(size.h / CELL);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const active = mouseRef.current.active;
      const maxDist = 80;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cx = x * CELL + CELL / 2;
          const cy = y * CELL + CELL / 2;
          const d = active ? Math.hypot(cx - mx, cy - my) : Infinity;
          const falloff = active ? Math.max(0, 1 - d / maxDist) : 0;
          if (falloff <= 0.02) continue;
          ctx.fillStyle = hexWithAlpha(tint, Math.min(0.95, falloff * 0.9));
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [tint]);

  return (
    <div
      className="relative h-full w-full cursor-crosshair"
      onPointerDown={(e) => {
        // Touch has no hover — a tap lights the grid at the touch point.
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
        mouseRef.current.active = true;
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
        mouseRef.current.active = true;
      }}
      onPointerLeave={() => {
        mouseRef.current.active = false;
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="relative z-10 h-full flex flex-col justify-between p-3 md:p-4 pointer-events-none">
        <div className="meta">
          Canvas / lab
        </div>
        <div>
          <div className="text-base md:text-lg font-medium text-[var(--color-v2-text)]">
            HOVER GRID
          </div>
          <div className="mt-1 text-xs text-[var(--color-v2-text)]/60 leading-snug hidden sm:block">
            move your cursor over me.
          </div>
        </div>
      </div>
    </div>
  );
}

function hexWithAlpha(hex: string, a: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

// ── Lab 2: reaction-time mini-game ─────────────────────────────────────────

type ReactionState = 'idle' | 'waiting' | 'go' | 'result' | 'early';

function ReactionLab({ tint }: { tint: string }) {
  const [state, setState] = useState<ReactionState>('idle');
  const [ms, setMs] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  function cleanup() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => cleanup, []);

  function begin(e: React.MouseEvent) {
    e.preventDefault();
    if (state === 'waiting') {
      cleanup();
      setState('early');
      return;
    }
    if (state === 'go') {
      const delta = performance.now() - startRef.current;
      setMs(delta);
      setBest((prev) => (prev === null ? delta : Math.min(prev, delta)));
      setState('result');
      return;
    }
    // idle | result | early -> start a new round
    cleanup();
    setState('waiting');
    const wait = 900 + Math.random() * 1800;
    timerRef.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setState('go');
    }, wait);
  }

  const bg =
    state === 'go'
      ? tint
      : state === 'waiting'
      ? '#20172b'
      : state === 'early'
      ? '#3a1a22'
      : 'transparent';

  const label =
    state === 'idle'
      ? 'TAP TO START'
      : state === 'waiting'
      ? 'WAIT…'
      : state === 'go'
      ? 'TAP!'
      : state === 'result'
      ? `${Math.round(ms ?? 0)} MS`
      : 'TOO EARLY';

  return (
    <button
      type="button"
      onClick={begin}
      className="relative h-full w-full text-left cursor-pointer"
      style={{ backgroundColor: bg }}
    >
      <div className="relative z-10 h-full flex flex-col justify-between p-3 md:p-4">
        <div className="meta">
          Mini-game / lab
        </div>
        <div>
          <div className="text-base md:text-lg font-medium text-[var(--color-v2-text)]">
            REACTION
          </div>
          <div className="mt-1 text-sm text-[var(--color-v2-text)]/80">
            {label}
          </div>
          {best !== null && (
            <div className="meta mt-2 text-[var(--color-v2-orange)]">
              BEST / {Math.round(best)}MS
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
