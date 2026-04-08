'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Section from './Section';

const feed = [
  { date: '2026.04.07', tag: 'BUILDING', text: 'redesigning this site as twilight CRT.' },
  { date: '2026.04.05', tag: 'READING',  text: '"Designing Data-Intensive Applications" — slowly.' },
  { date: '2026.04.02', tag: 'LEARNING', text: 'WebGL shaders. fragment math is humbling.' },
  { date: '2026.03.28', tag: 'SHIPPED',  text: 'pixel sun scene + canvas starfield prototype.' },
  { date: '2026.03.20', tag: 'THINKING', text: 'about the gap between ML demos and ML products.' },
];

export default function Now() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <Section id="now" marker="§ V" label="NOW" width="narrow">
      <div ref={ref} className="text-center">
        <h2
          className="text-4xl md:text-6xl lg:text-7xl tracking-tight text-[var(--color-v2-text)] mb-5"
          style={{ fontFamily: 'var(--font-family-pixel-v2)', fontWeight: 400 }}
        >
          CURRENTLY.
        </h2>
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
            {feed.map((entry, i) => (
              <motion.li
                key={entry.date + entry.tag}
                initial={{ opacity: 0, x: -6 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="grid grid-cols-[auto_auto_1fr] gap-x-4 items-baseline"
              >
                <span className="text-[10px] tracking-[0.15em] text-[var(--color-v2-muted)]">
                  {entry.date}
                </span>
                <span className="text-[10px] tracking-[0.2em] text-[var(--color-v2-orange)]">
                  [{entry.tag}]
                </span>
                <span className="text-[var(--color-v2-text)]/90 text-xs md:text-sm tracking-[0.05em]">
                  {entry.text}
                </span>
              </motion.li>
            ))}
            <motion.li
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: feed.length * 0.07 + 0.1 }}
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
