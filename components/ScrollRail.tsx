'use client';

import { useEffect, useRef, useState } from 'react';
import { lenisScrollTo, onLenisScroll } from '@/lib/lenis-store';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Selected work' },
  { id: 'stack', label: 'Stack' },
  { id: 'quests', label: 'Side quests' },
  { id: 'hackathons', label: 'Hackathons' },
  { id: 'contact', label: 'Contact' },
];

// Rail geometry, as fractions of the viewport height.
const RAIL_TOP = 0.2;
const RAIL_HEIGHT = 0.6;
// Left offset of the rail, in CSS px (a multiple of PX so it sits on the grid).
const RAIL_X = 24;
// The rail shows once this much of a viewport has scrolled past the hero…
const SHOW_AFTER = 0.75;
// …and hides once the contact section has risen this far up the viewport.
const HIDE_BEFORE = 0.55;

/**
 * Section navigation: a hairline in the left margin with the section numbers
 * on it, each lighting up as you reach it. (Your progress down the page is
 * shown by the moon — see Moon.tsx.) It keeps out of the two
 * scenes — hidden while the hero or the contact section is on screen. Narrow
 * screens get a plain progress line instead.
 */
export default function ScrollRail() {
  const fillRef = useRef<HTMLSpanElement | null>(null);
  // Marker positions along the rail (0..1), one per section.
  const [marks, setMarks] = useState<number[]>([]);
  const [shown, setShown] = useState(false);
  const [passed, setPassed] = useState(-1);

  useEffect(() => {
    let vh = window.innerHeight;
    let start = 0;
    let end = 1;
    let fractions: number[] = [];
    let scroll = window.scrollY;
    let wasShown = false;
    let wasPassed = -1;

    const along = (y: number) => Math.max(0, Math.min(1, (y - start) / Math.max(1, end - start)));

    function update(value: number) {
      scroll = value;
      const progress = along(scroll);
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress.toFixed(4)})`;

      let index = -1;
      fractions.forEach((f, i) => {
        if (progress >= f - 0.002) index = i;
      });
      const isShown = scroll >= start && scroll <= end;
      if (isShown !== wasShown) setShown((wasShown = isShown));
      if (index !== wasPassed) setPassed((wasPassed = index));
    }

    function measure() {
      vh = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      const tops = SECTIONS.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? Math.min(max, el.getBoundingClientRect().top + window.scrollY) : max;
      });
      start = SHOW_AFTER * vh;
      end = Math.max(start + 1, tops[tops.length - 1] - HIDE_BEFORE * vh);
      fractions = tops.map(along);
      setMarks(fractions);
      update(scroll);
    }

    measure();
    const offScroll = onLenisScroll(update);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => {
      offScroll();
      observer.disconnect();
    };
  }, []);

  const visibility = shown ? 'opacity-100' : 'pointer-events-none opacity-0';

  return (
    <>
      {/* Wide screens: the rail, its packet and the section numbers. */}
      <nav
        aria-label="Sections"
        className={`px-step fixed z-40 hidden lg:block ${visibility}`}
        style={{ left: RAIL_X, top: `${RAIL_TOP * 100}vh`, height: `${RAIL_HEIGHT * 100}vh` }}
      >
        <span aria-hidden className="absolute left-0 top-0 h-full w-px bg-[var(--color-v2-muted)]/30" />
        {marks.map((fraction, i) => (
          <button
            key={SECTIONS[i].id}
            type="button"
            title={SECTIONS[i].label}
            aria-label={`Go to ${SECTIONS[i].label}`}
            aria-current={i === passed ? 'true' : undefined}
            onClick={() => {
              const el = document.getElementById(SECTIONS[i].id);
              if (el) lenisScrollTo(el);
            }}
            className={`meta px-step absolute left-0 -translate-y-1/2 pl-4 pr-2 py-1 tabular-nums hover:text-[var(--color-v2-orange)] ${
              i === passed
                ? 'text-[var(--color-v2-orange)]'
                : i < passed
                  ? 'text-[var(--color-v2-text)]/80'
                  : ''
            }`}
            style={{ top: `${fraction * 100}%` }}
          >
            <span aria-hidden className="absolute left-0 top-1/2 h-px w-2 bg-current" />
            {String(i + 1).padStart(2, '0')}
          </button>
        ))}
      </nav>

      {/* Narrow screens: a progress line on the left edge. */}
      <span
        aria-hidden
        className={`px-step pointer-events-none fixed left-0 top-0 z-40 block lg:hidden h-lvh w-[2px] bg-[var(--color-v2-muted)]/15 ${visibility}`}
      >
        <span ref={fillRef} className="block h-full w-full origin-top bg-[var(--color-v2-orange)]" style={{ transform: 'scaleY(0)' }} />
      </span>
    </>
  );
}
