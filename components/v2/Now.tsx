'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Section from './Section';
import StaggerWords from './StaggerWords';

const feed = [
  { date: '2026.04.12', tag: 'INTERNING', text: 'game dev + full stack at Linchpin Soft Solutions.' },
  { date: '2026.04.07', tag: 'BUILDING',  text: 'redesigning this site as a twilight CRT.' },
  { date: '2026.04.02', tag: 'STUDYING',  text: 'B.Tech CSE at NIAT — semester four, AI track.' },
  { date: '2026.03.28', tag: 'SHIPPED',   text: 'spice express dispatch tools in production.' },
  { date: '2026.03.20', tag: 'THINKING',  text: 'about the gap between ML demos and ML products.' },
];

export default function Now() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <Section id="now" marker="§ VI" label="NOW" width="narrow">
      <div ref={ref} className="text-center">
        <StaggerWords
          className="text-4xl md:text-6xl lg:text-7xl tracking-tight text-[var(--color-v2-text)] mb-5"
          style={{ fontFamily: 'var(--font-family-display-v2)', fontWeight: 500 }}
        >
          CURRENTLY.
        </StaggerWords>
        <p className="text-base md:text-lg text-[var(--color-v2-text)]/70 max-w-2xl mx-auto mb-12">
          A small log of what&apos;s on my desk this week. Updated whenever I remember.
        </p>

        <div
          className="border border-[var(--color-v2-muted)]/20 bg-[var(--color-v2-surface)]/50 p-6 md:p-8 text-left"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          <div className="flex items-center justify-between text-[9px] tracking-[0.25em] text-[var(--color-v2-muted)] pb-3 mb-4 border-b border-[var(--color-v2-muted)]/15">
            <span>~/now.log</span>
            <span className="text-[var(--color-v2-orange)]">● LIVE</span>
          </div>

          <ul className="space-y-3">
            {feed.map((entry, i) => {
              const lineDelay = 0.4 + i * 0.35;
              return (
                <motion.li
                  key={entry.date + entry.tag}
                  initial={{
                    opacity: 0,
                    x: -8,
                    backgroundColor: 'rgba(255, 140, 66, 0.22)',
                  }}
                  animate={
                    inView
                      ? {
                          opacity: 1,
                          x: 0,
                          backgroundColor: 'rgba(255, 140, 66, 0)',
                        }
                      : {}
                  }
                  transition={{
                    opacity: { duration: 0.35, delay: lineDelay },
                    x: { duration: 0.35, delay: lineDelay },
                    backgroundColor: { duration: 1.2, delay: lineDelay + 0.4 },
                  }}
                  className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] gap-x-3 sm:gap-x-4 gap-y-1 items-baseline px-1 -mx-1"
                >
                  <span className="text-[10px] tracking-[0.15em] text-[var(--color-v2-muted)]">
                    {entry.date}
                  </span>
                  <span className="text-[10px] tracking-[0.2em] text-[var(--color-v2-orange)] col-start-2 sm:col-start-auto">
                    [{entry.tag}]
                  </span>
                  <span className="text-[var(--color-v2-text)]/90 text-xs md:text-sm tracking-[0.05em] col-span-2 sm:col-span-1">
                    {entry.text}
                  </span>
                </motion.li>
              );
            })}
            <motion.li
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + feed.length * 0.35 + 0.2 }}
              className="pt-2 text-[var(--color-v2-orange)] text-xs"
            >
              <span className="inline-block animate-pulse">▮</span>
            </motion.li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
