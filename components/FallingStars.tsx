'use client';

import { useEffect, useRef } from 'react';
import { onLenisScroll } from '@/lib/lenis-store';

// Content column (max-w-5xl) and its side padding at md+, as in Moon.tsx.
const COLUMN = 1024;
const GUTTER = 48;
// Narrowest margin the stars may ride in.
const MIN_MARGIN = 110;

interface Star {
  side: 'left' | 'right';
  /** Position across its margin: 0 = page edge, 1 = content edge. */
  across: number;
  /** Viewport height fraction at the top of the page, and at the bottom. */
  from: number;
  to: number;
  /** Side-to-side drift, in px. */
  sway: number;
  /** Where it comes to rest in the desk scene's sky, as a fraction of the scene's height. */
  land: number;
  big: boolean;
  color: string;
  twinkle: number;
}

// A handful, spread over both margins and kept clear of the moon's lane (the
// middle of the right margin) and the section rail (the left page edge).
const STARS: Star[] = [
  { side: 'left', across: 0.72, from: 0.08, to: 0.62, sway: 10, land: 0.22, big: true, color: '#ffd29a', twinkle: 0 },
  { side: 'left', across: 0.9, from: 0.3, to: 0.9, sway: 6, land: 0.42, big: false, color: '#c8cff0', twinkle: 0.7 },
  { side: 'left', across: 0.6, from: 0.5, to: 0.78, sway: 8, land: 0.6, big: false, color: '#b8b0e8', twinkle: 1.3 },
  { side: 'right', across: 0.85, from: 0.14, to: 0.84, sway: 8, land: 0.5, big: false, color: '#c8cff0', twinkle: 0.4 },
  { side: 'right', across: 0.18, from: 0.04, to: 0.5, sway: 12, land: 0.18, big: true, color: '#efe7cf', twinkle: 1.0 },
  { side: 'right', across: 0.25, from: 0.36, to: 0.95, sway: 6, land: 0.3, big: false, color: '#ffd29a', twinkle: 1.8 },
];

/**
 * A few stars that travel down the page with the moon: each sinks through
 * its margin at its own pace as you scroll, drifting a little side to side
 * and twinkling. As the contact section arrives they hand over to its sky —
 * each eases onto a spot in the desk scene and from then on scrolls with it,
 * so they move with the background instead of sitting pinned to the screen.
 * They only appear where there is a margin to ride in.
 */
export default function FallingStars() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let scroll = window.scrollY;

    function place() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const column = Math.min(vw - GUTTER * 2, COLUMN);
      const margin = (vw - column) / 2;
      const roomy = margin >= MIN_MARGIN;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      const progress = Math.max(0, Math.min(1, scroll / max));

      // Hand-over to the desk scene: 0 until the contact section starts to
      // enter the viewport, 1 at the bottom of the page.
      const contact = document.getElementById('contact');
      const scene = contact?.querySelector<HTMLElement>('[data-scene="desk"]');
      const sceneRect = scene?.getBoundingClientRect();
      const contactTop = contact ? contact.getBoundingClientRect().top + scroll : max + vh;
      const footStart = Math.min(max - 1, contactTop - vh);
      const raw = Math.max(0, Math.min(1, (scroll - footStart) / Math.max(1, max - footStart)));
      const handover = raw * raw * (3 - 2 * raw);

      STARS.forEach((star, i) => {
        const el = refs.current[i];
        if (!el) return;
        if (!roomy) {
          el.style.opacity = '0';
          return;
        }
        const inset = margin * star.across;
        const x = (star.side === 'left' ? inset : vw - inset) + Math.sin(progress * 6 + i) * star.sway;
        const drift = vh * (star.from + (star.to - star.from) * progress);
        // Pinned to the scene: rises with the background as the page scrolls.
        const landed = sceneRect ? sceneRect.top + star.land * sceneRect.height : drift;
        const y = drift + (landed - drift) * handover;
        el.style.opacity = '';
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
    }

    place();
    const offScroll = onLenisScroll((s) => {
      scroll = s;
      place();
    });
    window.addEventListener('resize', place);
    return () => {
      offScroll();
      window.removeEventListener('resize', place);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[44]">
      {STARS.map((star, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="absolute left-0 top-0 block"
          style={{ opacity: 0 }}
        >
          <svg
            width={star.big ? 12 : 4}
            height={star.big ? 12 : 4}
            viewBox={star.big ? '0 0 3 3' : '0 0 1 1'}
            shapeRendering="crispEdges"
            className="block -translate-x-1/2 -translate-y-1/2"
            style={{ animation: `star-twinkle 2.6s ease-in-out ${star.twinkle}s infinite` }}
          >
            <path d={star.big ? 'M1 0h1v1H1zM0 1h3v1H0zM1 2h1v1H1z' : 'M0 0h1v1H0z'} fill={star.color} />
          </svg>
        </span>
      ))}
    </div>
  );
}
