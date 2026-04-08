'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Section from './Section';

const quests = [
  { title: 'ASCII HERO', tag: 'EXPERIMENT', tint: '#4361ee' },
  { title: 'PIXEL SUNSET', tag: 'CANVAS', tint: '#ff8c42' },
  { title: 'SHADER FOG', tag: 'WEBGL', tint: '#7209b7' },
  { title: 'CMD-K MENU', tag: 'UI', tint: '#b06ab3' },
  { title: 'LENIS WIRING', tag: 'MOTION', tint: '#5b8def' },
  { title: 'CRT OVERLAY', tag: 'CSS', tint: '#ffb061' },
];

export default function SideQuests() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <Section id="quests" marker="§ IV" label="SIDE QUESTS" width="wide">
      <div ref={ref} className="text-center">
        <h2
          className="text-4xl md:text-6xl lg:text-7xl tracking-tight text-[var(--color-v2-text)] mb-5"
          style={{ fontFamily: 'var(--font-family-pixel-v2)', fontWeight: 400 }}
        >
          THE SKETCHBOOK.
        </h2>
        <p className="text-base md:text-lg text-[var(--color-v2-text)]/70 max-w-2xl mx-auto mb-14">
          Smaller, looser things. Half are demos, half are mistakes I learned from. None of them
          would survive a code review and that&apos;s the point.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-left">
          {quests.map((q, i) => (
            <motion.div
              key={q.title}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative aspect-square overflow-hidden border border-[var(--color-v2-muted)]/20 hover:border-[var(--color-v2-orange)]/60 transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--color-v2-surface)' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 50% 100%, ${q.tint}55 0%, transparent 70%)`,
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
              <div className="relative z-10 h-full flex flex-col justify-between p-4">
                <div
                  className="text-[9px] tracking-[0.25em] text-[var(--color-v2-muted)]"
                  style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
                >
                  ▸ {q.tag}
                </div>
                <div
                  className="text-base md:text-lg tracking-tight text-[var(--color-v2-text)] leading-tight group-hover:text-[var(--color-v2-orange)] transition-colors"
                  style={{ fontFamily: 'var(--font-family-pixel-v2)', fontWeight: 400 }}
                >
                  {q.title}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
