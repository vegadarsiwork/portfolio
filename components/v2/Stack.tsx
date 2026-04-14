'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Section from './Section';
import StaggerWords from './StaggerWords';

interface StackRow {
  label: string;
  tools: string[];
  note?: string;
}

const stack: StackRow[] = [
  {
    label: 'LANGUAGES',
    tools: ['TypeScript', 'Python', 'JavaScript', 'C / C++'],
  },
  {
    label: 'FRAMEWORKS',
    tools: ['React', 'Next.js', 'Node', 'Tailwind'],
  },
  {
    label: 'DATA & ML',
    tools: ['NumPy', 'Pandas', 'scikit-learn', 'Google Colab'],
  },
  {
    label: 'DESIGN',
    tools: ['Figma', 'Framer Motion', 'Pixel Art', 'Type & Rhythm'],
    note: 'badly, but improving',
  },
  {
    label: 'CURRENTLY LEARNING',
    tools: ['WebGL', 'Shaders', 'Rust'],
  },
];

export default function Stack() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <Section id="stack" marker="§ III" label="STACK" width="normal">
      <div ref={ref} className="text-center">
        <StaggerWords
          className="text-4xl md:text-6xl lg:text-7xl tracking-tight text-[var(--color-v2-text)] mb-5"
          style={{ fontFamily: 'var(--font-family-display-v2)', fontWeight: 500 }}
        >
          THE STACK.
        </StaggerWords>
        <p className="text-base md:text-lg text-[var(--color-v2-text)]/70 max-w-2xl mx-auto mb-12">
          Every tool I reach for without thinking, dumped from my dotfiles.
        </p>

        {/* Terminal block */}
        <div
          className="border border-[var(--color-v2-muted)]/20 bg-[var(--color-v2-surface)]/40 text-left"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          {/* Terminal header */}
          <div className="flex items-center justify-between text-[9px] tracking-[0.25em] text-[var(--color-v2-muted)] px-5 md:px-6 py-3 border-b border-[var(--color-v2-muted)]/15">
            <span>~/.vega/stack.txt</span>
            <span className="text-[var(--color-v2-orange)]">● READ-ONLY</span>
          </div>

          {/* Stack content */}
          <div className="px-5 md:px-8 py-8 md:py-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
              className="text-[10px] md:text-xs tracking-[0.2em] text-[var(--color-v2-muted)] mb-6"
            >
              <span className="text-[var(--color-v2-orange)]">$</span> cat
              ~/.vega/stack.txt
            </motion.div>

            <div className="space-y-5 md:space-y-6">
              {stack.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.07 }}
                  className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-6 gap-y-2 md:items-start"
                >
                  <div className="text-[10px] md:text-xs tracking-[0.25em] text-[var(--color-v2-orange)]">
                    [{row.label}]
                  </div>
                  <div className="text-sm md:text-base text-[var(--color-v2-text)]/90 leading-relaxed flex flex-wrap gap-x-3 gap-y-1">
                    {row.tools.map((t, ti) => (
                      <span key={t} className="whitespace-nowrap">
                        <span style={{ fontFamily: 'var(--font-family-body-v2)' }}>{t}</span>
                        {ti < row.tools.length - 1 && (
                          <span className="ml-3 text-[var(--color-v2-muted)]/60">·</span>
                        )}
                      </span>
                    ))}
                    {row.note && (
                      <span className="block w-full text-[var(--color-v2-muted)] italic text-xs mt-1">
                        — {row.note}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Terminal footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + stack.length * 0.07 }}
              className="mt-10 pt-5 border-t border-[var(--color-v2-muted)]/15 text-[10px] tracking-[0.2em] text-[var(--color-v2-muted)] flex items-center justify-between"
            >
              <span>last touched · april 2026</span>
              <span className="text-[var(--color-v2-orange)] animate-pulse">▮</span>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
