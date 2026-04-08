'use client';

import { motion } from 'framer-motion';
import PixelScene, { type Scene } from './PixelScene';

interface HeroProps {
  scene: Scene;
  hour: number;
  onHourChange: (h: number) => void;
  autoMode: boolean;
  onAutoToggle: () => void;
  presetLabel: string;
  /** False until client-side state is initialized — fades the canvas in. */
  mounted: boolean;
}

function formatHour(h: number): string {
  const hh = Math.floor(h) % 24;
  const mm = Math.round((h - Math.floor(h)) * 60);
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
}

export default function Hero({
  scene,
  hour,
  onHourChange,
  autoMode,
  onAutoToggle,
  presetLabel,
  mounted,
}: HeroProps) {
  return (
    <section className="relative min-h-screen w-full overflow-clip">
      {/* Pixel scene background — fades in once client values are set */}
      <div
        className="absolute inset-0 z-0"
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 600ms ease-out',
        }}
      >
        <PixelScene scene={scene} hour={hour} />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-48"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, #07070a 85%, #07070a 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'rgba(7, 7, 10, 0.2)' }}
        />
      </div>

      {/* Top bar — status pill on left, time slider on right */}
      <div className="absolute top-0 inset-x-0 z-20 px-6 md:px-12 pt-6 md:pt-8">
        <div className="max-w-6xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-3 text-[10px] md:text-xs tracking-[0.2em] text-[var(--color-v2-text)]"
            style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-v2-orange)] opacity-60 animate-ping [animation-duration:2s]" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-v2-orange)]" />
            </span>
            <span className="opacity-80">ONLINE</span>
            <span className="opacity-30">/</span>
            <span className="text-[var(--color-v2-orange)] hidden sm:inline tabular-nums">
              {mounted ? `${presetLabel} · ${formatHour(hour)}` : '— · —'}
            </span>
          </motion.div>

          {/* Time slider + AUTO toggle */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3 px-3 py-2 border border-[var(--color-v2-muted)]/30 bg-[var(--color-v2-bg)]/70 backdrop-blur-sm"
            style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
          >
            <span className="text-[9px] tracking-[0.2em] text-[var(--color-v2-muted)] hidden sm:inline">
              TIME
            </span>
            <input
              type="range"
              min={0}
              max={24}
              step={0.25}
              value={hour}
              onChange={(e) => onHourChange(parseFloat(e.target.value))}
              className="v2-time-slider"
              style={{ width: '220px' }}
              aria-label="Time of day"
            />
            <button
              onClick={onAutoToggle}
              className={`flex items-center gap-1.5 px-2 py-1 text-[9px] tracking-[0.15em] border transition-colors ${
                autoMode
                  ? 'border-[var(--color-v2-orange)] text-[var(--color-v2-orange)] bg-transparent'
                  : 'text-[var(--color-v2-text)]/70 border-[var(--color-v2-muted)]/40 hover:border-[var(--color-v2-orange)] hover:text-[var(--color-v2-orange)]'
              }`}
              title={autoMode ? 'Following wall clock — click to pause' : 'Click to follow wall clock'}
            >
              {autoMode && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-v2-orange)] opacity-60 animate-ping [animation-duration:1.8s]" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-v2-orange)]" />
                </span>
              )}
              AUTO
            </button>
          </motion.div>
        </div>
      </div>

      {/* Center: greeting wordmark + belief */}
      <div className="relative z-10 flex flex-col items-center justify-end min-h-screen px-6 md:px-12 pb-32 md:pb-40 text-center">
        <div className="max-w-5xl w-full">
          {/* "hey," — separate element, kept clear of the wordmark's glow halo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-[clamp(36px,9vw,108px)] leading-none tracking-tight text-[var(--color-v2-text)] mb-6 md:mb-10"
            style={{
              fontFamily: 'var(--font-family-hero-v2)',
              fontWeight: 400,
              textShadow:
                '0 2px 12px rgba(0, 0, 0, 0.6), 0 0 18px color-mix(in srgb, var(--color-v2-orange) 30%, transparent)',
            }}
          >
            hey,
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="block text-[clamp(56px,14vw,180px)] leading-[0.95] tracking-tight text-[var(--color-v2-text)]"
            style={{
              fontFamily: 'var(--font-family-hero-v2)',
              fontWeight: 400,
              textShadow:
                '0 0 32px color-mix(in srgb, var(--color-v2-orange) 55%, transparent), 0 0 90px color-mix(in srgb, var(--color-v2-orange) 25%, transparent)',
            }}
          >
            i&apos;m{' '}
            <span className="text-[var(--color-v2-orange)]">vega</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="mt-6 md:mt-8 text-lg md:text-2xl max-w-2xl mx-auto leading-snug text-[var(--color-v2-text)]/90"
          >
            Curiosity is my native language.{' '}
            <span className="text-[var(--color-v2-orange)]">Building things</span> is how I learn to speak it.
          </motion.p>
        </div>
      </div>

      {/* Bottom scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 text-center"
        style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
      >
        <div className="text-[9px] md:text-[10px] tracking-[0.3em] text-[var(--color-v2-muted)]">
          PRESS ↓ TO DESCEND
        </div>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[var(--color-v2-orange)] mt-2 text-xs"
        >
          ▼
        </motion.div>
      </motion.div>
    </section>
  );
}
