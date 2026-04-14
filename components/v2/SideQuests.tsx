'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Section from './Section';
import StaggerWords from './StaggerWords';
import { quests, type Quest } from '@/data/v2-quests';

export default function SideQuests() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <Section id="quests" marker="§ IV" label="SIDE QUESTS" width="wide">
      <div ref={ref} className="text-center">
        <StaggerWords
          className="text-4xl md:text-6xl lg:text-7xl tracking-tight text-[var(--color-v2-text)] mb-5"
          style={{ fontFamily: 'var(--font-family-display-v2)', fontWeight: 500 }}
        >
          THE SKETCHBOOK.
        </StaggerWords>
        <p className="text-base md:text-lg text-[var(--color-v2-text)]/70 max-w-2xl mx-auto mb-14">
          Smaller, looser things. Real repos, a couple of inline toys. Half are demos, half are
          mistakes I learned from. None of them would survive a code review and that&apos;s the
          point.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-left">
          {quests.map((q, i) => (
            <motion.div
              key={q.title}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <QuestCell quest={q} />
            </motion.div>
          ))}
        </div>
      </div>
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
    'group relative block aspect-square overflow-hidden border border-[var(--color-v2-muted)]/20 hover:border-[var(--color-v2-orange)]/60 transition-colors';

  if (quest.href && !quest.kind) {
    return (
      <a
        href={quest.href}
        target="_blank"
        rel="noreferrer"
        className={`${baseClass} cursor-pointer`}
        style={{ backgroundColor: 'var(--color-v2-surface)' }}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={baseClass} style={{ backgroundColor: 'var(--color-v2-surface)' }}>
      {content}
    </div>
  );
}

// ── Static tile (most cells) ───────────────────────────────────────────────

function StaticTile({ quest }: { quest: Quest }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 100%, ${quest.tint}55 0%, transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 5px)',
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between p-3 md:p-4">
        <div
          className="text-[9px] tracking-[0.25em] text-[var(--color-v2-muted)]"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          ▸ {quest.tag}
        </div>
        <div>
          <div
            className="text-base md:text-lg tracking-tight text-[var(--color-v2-text)] leading-tight group-hover:text-[var(--color-v2-orange)] transition-colors"
            style={{ fontFamily: 'var(--font-family-pixel-v2)', fontWeight: 400 }}
          >
            {quest.title}
          </div>
          {quest.blurb && (
            <div className="mt-1 text-[10px] md:text-[11px] text-[var(--color-v2-text)]/55 leading-snug hidden sm:block">
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CELL = 8; // logical pixel size
    let raf = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const cols = Math.ceil(rect.width / CELL);
      const rows = Math.ceil(rect.height / CELL);
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
          const base = 0.05 + 0.04 * Math.sin((x + y) * 0.6);
          const a = Math.min(0.95, base + falloff * 0.85);
          if (a < 0.06) continue;
          ctx.fillStyle = falloff > 0.02 ? hexWithAlpha(tint, a) : `rgba(138,125,160,${a.toFixed(3)})`;
          ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
        }
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [tint]);

  return (
    <div
      className="relative h-full w-full cursor-crosshair"
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
      <div className="relative z-10 h-full flex flex-col justify-between p-4 pointer-events-none">
        <div
          className="text-[9px] tracking-[0.25em] text-[var(--color-v2-muted)]"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          ▸ CANVAS · LAB
        </div>
        <div>
          <div
            className="text-base md:text-lg tracking-tight text-[var(--color-v2-text)] leading-tight"
            style={{ fontFamily: 'var(--font-family-pixel-v2)', fontWeight: 400 }}
          >
            HOVER GRID
          </div>
          <div className="mt-1 text-[10px] md:text-[11px] text-[var(--color-v2-text)]/55 leading-snug hidden sm:block">
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
    // idle | result | early → start a new round
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
      style={{ backgroundColor: bg, transition: 'background-color 90ms linear' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 5px)',
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between p-3 md:p-4">
        <div
          className="text-[9px] tracking-[0.25em] text-[var(--color-v2-muted)]"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          ▸ MINI-GAME · LAB
        </div>
        <div>
          <div
            className="text-base md:text-lg tracking-tight text-[var(--color-v2-text)] leading-tight"
            style={{ fontFamily: 'var(--font-family-pixel-v2)', fontWeight: 400 }}
          >
            REACTION
          </div>
          <div className="mt-1 text-[11px] text-[var(--color-v2-text)]/70 leading-snug">
            {label}
          </div>
          {best !== null && (
            <div
              className="mt-2 text-[10px] tracking-[0.2em] text-[var(--color-v2-orange)]"
              style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
            >
              BEST · {Math.round(best)}MS
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
