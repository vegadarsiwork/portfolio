'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Section from './Section';
import StaggerWords from './StaggerWords';
import { hackathons } from '@/data/v2-hackathons';

function resultColor(result: string): string {
  if (/1st|winner/i.test(result)) return 'var(--color-v2-orange)';
  if (/finalist/i.test(result)) return '#ffb061';
  return 'var(--color-v2-muted)';
}

export default function Hackathons() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <Section id="hackathons" marker="§ V" label="HACKATHON ARCHIVE" width="wide">
      <div ref={ref} className="text-center">
        <StaggerWords
          className="text-4xl md:text-6xl lg:text-7xl tracking-tight text-[var(--color-v2-text)] mb-5"
          style={{ fontFamily: 'var(--font-family-display-v2)', fontWeight: 500 }}
        >
          THINGS I RAN AT 3AM.
        </StaggerWords>
        <p className="text-base md:text-lg text-[var(--color-v2-text)]/70 max-w-2xl mx-auto mb-14">
          A running log of hackathons and ML experiments — some won, most didn&apos;t, all taught me
          something I couldn&apos;t have learned from a tutorial.
        </p>

        {/* Archive table */}
        <div
          className="border border-[var(--color-v2-muted)]/20 bg-[var(--color-v2-surface)]/40 text-left"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between text-[9px] tracking-[0.25em] text-[var(--color-v2-muted)] px-5 md:px-6 py-3 border-b border-[var(--color-v2-muted)]/15">
            <span>~/.vega/hackathons.log</span>
            <span className="text-[var(--color-v2-orange)]">● {hackathons.length} ENTRIES</span>
          </div>

          <ul className="divide-y divide-[var(--color-v2-muted)]/10">
            {hackathons.map((h, i) => (
              <motion.li
                key={h.title + h.year}
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
                className="px-4 md:px-6 py-5 md:py-6 grid grid-cols-[auto_1fr] md:grid-cols-[90px_1fr_auto] gap-x-4 md:gap-x-6 gap-y-2 md:items-start hover:bg-[var(--color-v2-surface)]/70 transition-colors"
              >
                {/* Year */}
                <div className="text-[10px] md:text-xs tracking-[0.25em] text-[var(--color-v2-orange)] pt-[2px]">
                  [{h.year}]
                </div>

                {/* Result badge top-right on mobile, right column on desktop */}
                <div className="md:hidden justify-self-end pt-[2px]">
                  <span
                    className="text-[10px] tracking-[0.25em]"
                    style={{ color: resultColor(h.result) }}
                  >
                    ● {h.result.toUpperCase()}
                  </span>
                </div>

                {/* Title + event + summary + stack */}
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mb-1">
                    <span
                      className="text-xl md:text-2xl tracking-tight text-[var(--color-v2-text)]"
                      style={{ fontFamily: 'var(--font-family-display-v2)', fontWeight: 500 }}
                    >
                      {h.title}
                    </span>
                    <span className="text-[10px] tracking-[0.25em] text-[var(--color-v2-muted)] break-words">
                      · {h.event}
                    </span>
                  </div>
                  <p
                    className="text-sm md:text-[15px] text-[var(--color-v2-text)]/80 leading-relaxed mb-3"
                    style={{ fontFamily: 'var(--font-family-body-v2)' }}
                  >
                    {h.summary}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] tracking-[0.2em] text-[var(--color-v2-muted)]">
                    {h.stack.map((t, ti) => (
                      <span key={t} className="whitespace-nowrap">
                        <span style={{ fontFamily: 'var(--font-family-body-v2)' }}>{t}</span>
                        {ti < h.stack.length - 1 && (
                          <span className="ml-3 text-[var(--color-v2-muted)]/40">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Result (desktop only) + links */}
                <div className="col-span-2 md:col-span-1 flex flex-col items-start md:items-end gap-2 md:pt-[2px]">
                  <span
                    className="hidden md:inline text-xs tracking-[0.25em]"
                    style={{ color: resultColor(h.result) }}
                  >
                    ● {h.result.toUpperCase()}
                  </span>
                  <div className="flex gap-2">
                    {h.demo && (
                      <a
                        href={h.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] tracking-[0.2em] px-3 py-1 border border-[var(--color-v2-orange)]/60 text-[var(--color-v2-orange)] hover:bg-[var(--color-v2-orange)] hover:text-[var(--color-v2-bg)] transition-colors"
                      >
                        LIVE →
                      </a>
                    )}
                    {h.repo && (
                      <a
                        href={h.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] tracking-[0.2em] px-3 py-1 border border-[var(--color-v2-muted)]/40 text-[var(--color-v2-text)] hover:border-[var(--color-v2-text)] transition-colors"
                      >
                        CODE →
                      </a>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.15 + hackathons.length * 0.06 }}
            className="px-5 md:px-6 py-3 border-t border-[var(--color-v2-muted)]/15 text-[10px] tracking-[0.25em] text-[var(--color-v2-muted)] flex items-center justify-between"
          >
            <span>EOF · still adding</span>
            <span className="text-[var(--color-v2-orange)] animate-pulse">▮</span>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
