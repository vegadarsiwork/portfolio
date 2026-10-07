'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import PixelScene from './PixelScene';
import type { V2MotionSettings } from '@/lib/motion-settings';
import { onLenisScroll } from '@/lib/lenis-store';

interface HeroProps {
  hour: number;
  onHourChange: (h: number) => void;
  autoMode: boolean;
  onAutoToggle: () => void;
  /** False until client-side state is initialized. */
  mounted: boolean;
  motionSettings: V2MotionSettings;
}

function formatHour(h: number): string {
  const hh = Math.floor(h) % 24;
  const mm = Math.round((h - Math.floor(h)) * 60);
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
}

// Status bar: where I am, and the clock there.
const LOCATION = 'India';
const TIME_ZONE = 'Asia/Kolkata';
const ZONE_LABEL = 'IST';

/** The current HH:MM in a time zone, or null until the client has mounted. */
function useLocalTime(timeZone: string): string | null {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false });
    const tick = () => setTime(format.format(new Date()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 15_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [timeZone]);
  return time;
}

const EASE = [0.21, 0.47, 0.32, 0.98] as const;
const enter = (delay: number) => ({ duration: 0.9, delay, ease: EASE });

export default function Hero({
  hour,
  onHourChange,
  autoMode,
  onAutoToggle,
  mounted,
  motionSettings,
}: HeroProps) {
  const copyRef = useRef<HTMLDivElement | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const localTime = useLocalTime(TIME_ZONE);
  const isNight = hour < 6 || hour >= 19;
  // The wordmark is plain against a dark sky. Only a bright daytime sky (if the
  // visitor moves the clock there) needs the outline to stay readable.
  const ink = hour > 6.5 && hour < 17.4 ? 'px-shadow' : '';

  // Scroll-driven exit: the wordmark climbs faster than the page and fades out.
  // Driven by the Lenis scroll value so it stays in the same frame as the
  // content (see lenis-store).
  useEffect(() => {
    if (motionSettings.reduceMotion) return;
    const update = (scroll: number) => {
      const el = copyRef.current;
      if (!el) return;
      const progress = Math.min(1, scroll / (window.innerHeight * 0.7));
      el.style.transform = `translate3d(0, ${(-scroll * 0.3).toFixed(1)}px, 0)`;
      el.style.opacity = String(1 - progress);
    };
    update(window.scrollY); // initial position before Lenis emits
    return onLenisScroll(update);
  }, [motionSettings.reduceMotion]);

  return (
    <section className="relative min-h-screen w-full overflow-clip select-none">
      {/* The skyline. It belongs to the hero and scrolls away with it. */}
      <PixelScene view="skyline" hour={hour} fps={motionSettings.sceneFps} />

      {/* Status bar — who, where, and the local time there. The button on the
          right changes the scene's time of day, which is separate from it. */}
      <div className="absolute top-0 inset-x-0 z-20 px-5 md:px-12 pt-4 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={enter(0.2)}
          className="max-w-5xl mx-auto flex items-center justify-between gap-4"
        >
          <span className="meta px-outline text-[var(--color-v2-text)]">Vega Darsi</span>

          <div className="flex items-center gap-3 md:gap-4">
            <span className="meta px-outline flex items-center gap-2 tabular-nums whitespace-nowrap">
              <span>{LOCATION}</span>
              <span aria-hidden>/</span>
              <span>
                <span className="text-[var(--color-v2-text)]">{localTime ?? '--:--'}</span> {ZONE_LABEL}
              </span>
            </span>

            {/* Sky control — the button stays in place; the slider floats below
                it as a popover so nothing in the bar shifts when it opens. */}
            <div className="relative">
              <button
                onClick={() => setControlsOpen((v) => !v)}
                className={`px-step flex h-9 w-9 items-center justify-center border bg-[var(--color-v2-bg)]/80 ${
                  controlsOpen
                    ? 'border-[var(--color-v2-orange)]'
                    : 'border-[var(--color-v2-muted)]/40 hover:border-[var(--color-v2-orange)]'
                }`}
                aria-label={controlsOpen ? 'Close sky controls' : 'Change the sky’s time of day'}
                aria-expanded={controlsOpen}
                title={`Sky / ${mounted ? formatHour(hour) : '-'}`}
              >
                <TimeIcon isNight={isNight} />
              </button>

            <AnimatePresence>
              {controlsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="absolute right-0 top-full mt-2 z-30 flex items-center gap-3 px-3 py-2 border border-[var(--color-v2-orange)]/60 bg-[var(--color-v2-bg)]"
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
                    className={`meta px-step shrink-0 flex items-center gap-2 px-2 py-1 border ${
                      autoMode
                        ? 'border-[var(--color-v2-orange)] text-[var(--color-v2-orange)]'
                        : 'border-[var(--color-v2-muted)]/40 hover:border-[var(--color-v2-orange)] hover:text-[var(--color-v2-orange)]'
                    }`}
                    title={autoMode ? 'Following wall clock - click to pause' : 'Click to follow wall clock'}
                  >
                    Auto
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Left: greeting wordmark + belief, on the same column as the rest of the page */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-5 md:px-12 pb-[16vh]">
        <div ref={copyRef} className="max-w-5xl mx-auto w-full will-change-transform">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(0.4)}
            className={`pxh-hey px-glow text-[var(--color-v2-text)] mb-2 md:mb-4 ${ink}`}
          >
            hey,
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(0.55)}
            className={`pxh-1 px-glow text-[var(--color-v2-text)] ${ink}`}
          >
            i&apos;m{' '}
            <span className="text-[var(--color-v2-orange)]">vega</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(0.85)}
            className="px-outline mt-6 md:mt-8 text-base md:text-xl font-medium max-w-md leading-snug text-[var(--color-v2-text)]"
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
        transition={enter(1.4)}
        className="pointer-events-none absolute bottom-6 md:bottom-10 inset-x-0 z-20 flex flex-col items-center gap-2"
      >
        {/* Centred in the viewport: the word, with the chevron under it. */}
        <span className="meta px-outline whitespace-nowrap">Scroll</span>
        {/* Drawn as pixels (2px each, two rows thick) rather than a letter, and
            bobbed by a stepped CSS animation (see .px-bob). */}
        <svg
          width="14"
          height="10"
          viewBox="0 0 7 5"
          shapeRendering="crispEdges"
          aria-hidden
          className="px-bob block text-[var(--color-v2-orange)]"
        >
          <path
            d="M0 0h1v2H0zM6 0h1v2H6zM1 1h1v2H1zM5 1h1v2H5zM2 2h1v2H2zM4 2h1v2H4zM3 3h1v2H3z"
            fill="currentColor"
          />
        </svg>
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
