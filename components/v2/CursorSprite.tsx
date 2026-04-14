'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const TRAIL_LENGTH = 7;
const MAX_SPEED = 46;

interface ClickFlash {
  x: number;
  y: number;
  id: number;
}

/**
 * Cursor sprite + motion-reactive comet trail + click flash burst.
 * - Main pixel star follows the cursor with lerp
 * - Trail stretches and brightens with velocity
 * - Clicking spawns a star burst that scales and fades at the click point
 * Hidden on touch devices.
 */
export default function CursorSprite() {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isTouch, setIsTouch] = useState(false);
  const [flashes, setFlashes] = useState<ClickFlash[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = window.setTimeout(() => {
      const touch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouch(touch);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    if (typeof window === 'undefined') return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const main = { x: target.x, y: target.y };
    const velocity = { x: 0, y: 0, speed: 0 };
    const trail = Array.from({ length: TRAIL_LENGTH }, () => ({
      x: target.x,
      y: target.y,
    }));

    let raf = 0;
    let visible = false;

    function setVisible(v: boolean) {
      if (visible === v) return;
      visible = v;
      if (!v) {
        if (mainRef.current) mainRef.current.style.opacity = '0';
        trailRefs.current.forEach((el) => {
          if (!el) return;
          el.style.opacity = '0';
        });
      }
    }

    function onMove(e: MouseEvent) {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) setVisible(true);
    }

    function onLeave() {
      setVisible(false);
    }

    function onClick(e: MouseEvent) {
      const id = performance.now();
      setFlashes((prev) => [...prev, { x: e.clientX, y: e.clientY, id }]);
      window.setTimeout(() => {
        setFlashes((prev) => prev.filter((f) => f.id !== id));
      }, 700);
    }

    function tick() {
      const dx = target.x - main.x;
      const dy = target.y - main.y;
      velocity.x = dx;
      velocity.y = dy;
      velocity.speed += (Math.hypot(dx, dy) - velocity.speed) * 0.22;
      const speedNorm = Math.min(1, velocity.speed / MAX_SPEED);

      main.x += dx * 0.22;
      main.y += dy * 0.22;

      if (mainRef.current) {
        const headScale = 1 + speedNorm * 0.22;
        const headGlow = visible ? 0.82 + speedNorm * 0.18 : 0;
        mainRef.current.style.opacity = headGlow.toFixed(2);
        mainRef.current.style.transform = `translate3d(${main.x.toFixed(1)}px, ${main.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${headScale.toFixed(3)})`;
      }

      let prevX = main.x;
      let prevY = main.y;
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const pos = trail[i];
        const chase = 0.32 - i * 0.022 + speedNorm * 0.03;
        pos.x += (prevX - pos.x) * chase;
        pos.y += (prevY - pos.y) * chase;

        const el = trailRefs.current[i];
        if (el) {
          const tailT = i / Math.max(1, TRAIL_LENGTH - 1);
          const spreadX = velocity.x * (0.045 + tailT * 0.018) * speedNorm;
          const spreadY = velocity.y * (0.045 + tailT * 0.018) * speedNorm;
          const opacity = visible ? (0.72 - tailT * 0.58) * (0.45 + speedNorm * 0.95) : 0;
          const scale = 1.08 - tailT * 0.48 + speedNorm * (0.16 - tailT * 0.06);
          el.style.opacity = Math.max(0, opacity).toFixed(2);
          el.style.transform = `translate3d(${(pos.x - spreadX).toFixed(1)}px, ${(pos.y - spreadY).toFixed(1)}px, 0) translate(-50%, -50%) scale(${Math.max(0.35, scale).toFixed(3)})`;
        }

        prevX = pos.x;
        prevY = pos.y;
      }

      raf = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('click', onClick);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <>
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          aria-hidden
          className="fixed top-0 left-0 z-[99] pointer-events-none"
          style={{
            opacity: 0,
            transition: 'opacity 120ms linear',
            willChange: 'transform',
          }}
        >
          <PixelDot size={7 - Math.min(i, 4)} index={i} />
        </div>
      ))}

      <div
        ref={mainRef}
        aria-hidden
        className="fixed top-0 left-0 z-[100] pointer-events-none"
        style={{
          opacity: 0,
          transition: 'opacity 180ms ease-out',
          willChange: 'transform',
        }}
      >
        <PixelStar />
      </div>

      <AnimatePresence>
        {flashes.map((flash) => (
          <motion.div
            key={flash.id}
            aria-hidden
            className="fixed top-0 left-0 z-[101] pointer-events-none"
            style={{
              left: flash.x,
              top: flash.y,
              willChange: 'transform, opacity',
            }}
            initial={{ scale: 0.4, opacity: 1, x: '-50%', y: '-50%' }}
            animate={{ scale: 2.4, opacity: 0, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 0.84, 0.44, 1] }}
          >
            <PixelStarBurst />
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}

function PixelStar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 7 7"
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      <rect x="3" y="0" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.6" />
      <rect x="3" y="1" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="0" y="3" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.6" />
      <rect x="1" y="3" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="2" y="3" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="3" y="3" width="1" height="1" fill="#ffffff" />
      <rect x="4" y="3" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="5" y="3" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="6" y="3" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.6" />
      <rect x="3" y="4" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="3" y="5" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="3" y="6" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.6" />
    </svg>
  );
}

function PixelDot({ size = 4, index = 0 }: { size?: number; index?: number }) {
  const warmMix = Math.max(0.24, 0.72 - index * 0.08);
  return (
    <div
      style={{
        width: size,
        height: size,
        background:
          index === 0
            ? '#ffffff'
            : `color-mix(in srgb, #ffffff ${Math.round(warmMix * 100)}%, var(--color-v2-orange))`,
        boxShadow: `0 0 ${6 + Math.max(0, 3 - index)}px color-mix(in srgb, var(--color-v2-orange) 78%, transparent)`,
      }}
    />
  );
}

function PixelStarBurst() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 9 9"
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      <rect x="4" y="0" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.5" />
      <rect x="4" y="1" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.85" />
      <rect x="4" y="2" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="4" y="3" width="1" height="1" fill="#ffffff" />
      <rect x="4" y="4" width="1" height="1" fill="#ffffff" />
      <rect x="4" y="5" width="1" height="1" fill="#ffffff" />
      <rect x="4" y="6" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="4" y="7" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.85" />
      <rect x="4" y="8" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.5" />

      <rect x="0" y="4" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.5" />
      <rect x="1" y="4" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.85" />
      <rect x="2" y="4" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="3" y="4" width="1" height="1" fill="#ffffff" />
      <rect x="5" y="4" width="1" height="1" fill="#ffffff" />
      <rect x="6" y="4" width="1" height="1" fill="var(--color-v2-orange)" />
      <rect x="7" y="4" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.85" />
      <rect x="8" y="4" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.5" />

      <rect x="2" y="2" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.7" />
      <rect x="6" y="2" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.7" />
      <rect x="2" y="6" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.7" />
      <rect x="6" y="6" width="1" height="1" fill="var(--color-v2-orange)" opacity="0.7" />
    </svg>
  );
}
