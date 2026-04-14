'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import PixelScene from './PixelScene';

interface HeroProps {
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
  hour,
  onHourChange,
  autoMode,
  onAutoToggle,
  presetLabel,
  mounted,
}: HeroProps) {
  const bgWrapperRef = useRef<HTMLDivElement | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const isNight = hour < 6 || hour >= 19;

  // Scroll-driven parallax — RAF loop reads window.scrollY and updates
  // transform on the bg/fg wrapper refs at different speeds. The wordmark
  // is part of the page flow and scrolls at 100% speed; the bg moves
  // slowest, the fg moves close to wordmark speed, creating depth as you
  // scroll past the hero.
  useEffect(() => {
    let raf = 0;
    let lastY = -1;

    function tick() {
      const sy = window.scrollY;
      // Only need to update when scroll actually changed
      if (sy !== lastY) {
        lastY = sy;
        // Cap parallax to first viewport so we don't keep updating after
        // the hero is off-screen
        const cap = window.innerHeight;
        const capped = Math.min(sy, cap);
        // Pull-back factors: bg pulled back 50% (so it appears to move at
        // 50% speed), fg pulled back 15% (90% effective speed). Wordmark
        // is untransformed so it scrolls at 100%.
        if (bgWrapperRef.current) {
          bgWrapperRef.current.style.transform = `translate3d(0, ${(capped * 0.5).toFixed(1)}px, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-clip select-none">
      {/* Background layer — sky, sun/moon, distant skyline. Slow parallax. */}
      <div
        ref={bgWrapperRef}
        className="absolute inset-0 z-0"
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 600ms ease-out',
          willChange: 'transform',
        }}
      >
        <PixelScene hour={hour} />
      </div>

      {/* Foreground layer — close large silhouette. Faster parallax. */}

      {/* Bottom fade + global dim — layered on top of both canvases */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
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
      <div className="absolute top-0 inset-x-0 z-20 px-4 md:px-12 pt-4 md:pt-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
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

          {/* Time controls — pill stays in place; expanded slider floats
              as an absolute-positioned popover below it so nothing in
              the top bar shifts when it opens. */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
            style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
          >
            <button
              onClick={() => setControlsOpen((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 border bg-[var(--color-v2-bg)]/70 backdrop-blur-sm transition-colors ${
                controlsOpen
                  ? 'border-[var(--color-v2-orange)]'
                  : 'border-[var(--color-v2-muted)]/30 hover:border-[var(--color-v2-orange)]'
              }`}
              aria-label={controlsOpen ? 'Close time controls' : 'Open time controls'}
              aria-expanded={controlsOpen}
              title={`Time · ${mounted ? formatHour(hour) : '—'}`}
            >
              <TimeIcon isNight={isNight} />
              <span className="text-[10px] tracking-[0.2em] text-[var(--color-v2-text)]/80 tabular-nums">
                {mounted ? formatHour(hour) : '—'}
              </span>
            </button>

            <AnimatePresence>
              {controlsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="absolute right-0 top-full mt-2 z-30 flex items-center gap-3 px-3 py-2 border border-[var(--color-v2-orange)]/50 bg-[var(--color-v2-bg)]/90 backdrop-blur-sm origin-top-right"
                  style={{ transformOrigin: 'top right' }}
                >
                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={0.25}
                    value={hour}
                    onChange={(e) => onHourChange(parseFloat(e.target.value))}
                    className="v2-time-slider"
                    style={{ width: '180px' }}
                    aria-label="Time of day"
                  />
                  <button
                    onClick={onAutoToggle}
                    className={`shrink-0 flex items-center gap-1.5 px-2 py-1 text-[9px] tracking-[0.15em] border transition-colors ${
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
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Center: greeting wordmark + belief */}
      <div className="relative z-10 flex flex-col items-center justify-end min-h-screen px-5 md:px-12 pt-32 md:pt-60 pb-40 md:pb-56 text-center">
        <div className="max-w-5xl w-full">
          {/* "hey," — separate element, kept clear of the wordmark's glow halo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-[clamp(32px,8vw,96px)] leading-none tracking-tight text-[var(--color-v2-text)] mb-2 md:mb-4"
            style={{
              fontFamily: 'var(--font-family-hero-v2)',
              fontWeight: 400,
              textShadow:
                '0 2px 16px rgba(0, 0, 0, 0.7), 0 0 18px color-mix(in srgb, var(--color-v2-orange) 30%, transparent)',
            }}
          >
            hey,
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="block -mt-1 md:-mt-2 text-[clamp(52px,12vw,160px)] leading-[0.95] tracking-tight text-[var(--color-v2-text)]"
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

function TimeIcon({ isNight }: { isNight: boolean }) {
  // Hand-drawn 7x7 pixel sun / moon in SVG so it scales with the UI.
  const color = 'var(--color-v2-orange)';
  if (isNight) {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 7 7"
        shapeRendering="crispEdges"
        aria-hidden
      >
        <path
          d="M2 0h3v1H2zM1 1h1v1H1zM4 1h2v1H4zM0 2h2v1H0zM4 2h1v1H4zM0 3h2v1H0zM3 3h2v1H3zM0 4h2v1H0zM3 4h1v1H3zM1 5h1v1H1zM4 5h2v1H4zM2 6h3v1H2z"
          fill={color}
        />
      </svg>
    );
  }
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 7 7"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <path
        d="M3 0h1v1H3zM1 1h1v1H1zM5 1h1v1H5zM2 2h3v1H2zM0 3h7v1H0zM2 4h3v1H2zM1 5h1v1H1zM5 5h1v1H5zM3 6h1v1H3z"
        fill={color}
      />
    </svg>
  );
}
