'use client';

import { useEffect, useState } from 'react';
import { lenisScrollTo, onLenisScroll } from '@/lib/lenis-store';

// Pixel rocket body. X = body, O = window (cut). The exhaust flame is a separate
// animated layer drawn below.
const ROCKET = [
  '......X......',
  '.....XXX.....',
  '....XXXXX....',
  '....XOOOX....',
  '....XOOOX....',
  '....XXXXX....',
  '....XXXXX....',
  '...XXXXXXX...',
  '..XX.XXX.XX..',
  '..X..XXX..X..',
  '.....XXX.....',
];

export default function ScrollTopRocket() {
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);

  const launch = () => {
    if (launching) return;
    setLaunching(true);
    lenisScrollTo(0);
    window.setTimeout(() => setLaunching(false), 800);
  };

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

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={launch}
      className={`group fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center overflow-hidden border border-[var(--color-v2-muted)]/30 bg-[var(--color-v2-surface)]/60 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-v2-text)]/60 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <svg
        viewBox="0 0 13 16"
        width="26"
        height="32"
        shapeRendering="crispEdges"
        aria-hidden="true"
        className={`rocket-svg transition-transform duration-300 group-hover:-translate-y-0.5 ${
          launching ? 'launching' : ''
        }`}
      >
        {/* Animated exhaust flame */}
        <g className="flame">
          <rect x={5} y={11} width={3} height={1} fill="#ffe9a0" />
          <rect x={5} y={12} width={3} height={1} fill="#ffb02e" />
          <rect x={6} y={13} width={1} height={1} fill="#ff7a1a" />
        </g>
        {/* Body */}
        <g className="text-[var(--color-v2-text)]/75 group-hover:text-[var(--color-v2-text)] transition-colors">
          {ROCKET.flatMap((row, y) =>
            row.split('').map((ch, x) =>
              ch === '.' ? null : (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width={1}
                  height={1}
                  fill={ch === 'O' ? 'var(--color-v2-bg)' : 'currentColor'}
                />
              )
            )
          )}
        </g>
      </svg>

      <style jsx>{`
        .flame {
          transform-box: fill-box;
          transform-origin: top center;
          --flame: 1;
          animation: rocketFlame 0.4s steps(2, end) infinite;
        }
        .group:hover .flame {
          --flame: 1.8;
          animation-duration: 0.22s;
        }
        @keyframes rocketFlame {
          0%,
          100% {
            transform: scaleY(var(--flame));
            opacity: 1;
          }
          50% {
            transform: scaleY(calc(var(--flame) * 0.6));
            opacity: 0.7;
          }
        }

        /* Click feedback: crouch, then blast off up and out of the button. */
        .rocket-svg.launching {
          animation: rocketLaunch 0.7s cubic-bezier(0.5, 0, 0.7, 0) forwards;
        }
        .rocket-svg.launching .flame {
          --flame: 2.6;
          animation-duration: 0.08s;
        }
        @keyframes rocketLaunch {
          0% {
            transform: translateY(0) scaleY(1);
          }
          16% {
            transform: translateY(2px) scaleY(0.82);
          }
          34% {
            transform: translateY(-3px) scaleY(1.14);
            opacity: 1;
          }
          100% {
            transform: translateY(-40px) scaleY(1.18);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .flame {
            animation: none;
          }
          .rocket-svg.launching {
            animation: none;
          }
        }
      `}</style>
    </button>
  );
}
