'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { Chapter } from '@/data/v2-chapters';

interface Props {
  chapter: Chapter;
}

/**
 * Stacked editorial chapter — everything flows in a single centered column:
 * numeral + title + metaphor → visual → story → meta + links.
 */
export default function ProjectChapter({ chapter }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <article
      ref={ref}
      className="relative px-6 md:px-12 py-20 md:py-28 border-t border-[var(--color-v2-muted)]/15"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Numeral + label */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="inline-flex items-baseline gap-4 mb-4"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          <span className="text-[var(--color-v2-orange)] text-xs md:text-sm tracking-[0.25em]">
            PROJECT
          </span>
          <span
            className="text-[var(--color-v2-orange)] text-5xl md:text-7xl leading-none"
            style={{
              fontWeight: 400,
              textShadow: '0 0 24px color-mix(in srgb, var(--color-v2-orange) 45%, transparent)',
            }}
          >
            {chapter.numeral}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-[var(--color-v2-text)] mb-5"
          style={{
            fontFamily: 'var(--font-family-pixel-v2)',
            fontWeight: 400,
            textShadow: '0 0 20px color-mix(in srgb, var(--color-v2-orange) 25%, transparent), 0 0 40px color-mix(in srgb, var(--color-v2-orange) 15%, transparent)',
          }}
        >
          {chapter.title}
        </motion.h3>

        {/* Metaphor */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl italic text-[var(--color-v2-purple)] max-w-3xl mx-auto mb-12 md:mb-16"
          style={{ filter: 'brightness(1.4)' }}
        >
          {chapter.metaphor}
        </motion.p>

        {/* Visual block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-10 md:mb-14"
        >
          <ChapterVisual chapter={chapter} />
          <div
            className="mt-3 text-[11px] tracking-[0.2em] text-[var(--color-v2-muted)]"
            style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
          >
            ── {chapter.caption}
          </div>
        </motion.div>

        {/* Story — single centered column */}
        <div className="max-w-2xl mx-auto space-y-5 text-[var(--color-v2-text)]/85 text-base md:text-[17px] leading-relaxed text-left">
          {chapter.story.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 + i * 0.08 }}
            >
              {p}
            </motion.p>
          ))}
        </div>

        {/* Meta + links row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-12 md:mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-4"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          <span className="text-[10px] md:text-xs tracking-[0.25em] text-[var(--color-v2-muted)]">
            {chapter.meta}
          </span>
          <span className="text-[10px] md:text-xs tracking-[0.25em] text-[var(--color-v2-muted)]/60">
            · {chapter.year} ·
          </span>
          <div className="flex gap-3">
            {chapter.demo && (
              <a
                href={chapter.demo}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] tracking-[0.2em] px-4 py-2 border border-[var(--color-v2-orange)]/60 text-[var(--color-v2-orange)] hover:bg-[var(--color-v2-orange)] hover:text-[var(--color-v2-bg)] transition-colors"
              >
                LIVE →
              </a>
            )}
            {chapter.repo && (
              <a
                href={chapter.repo}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] tracking-[0.2em] px-4 py-2 border border-[var(--color-v2-muted)]/40 text-[var(--color-v2-text)] hover:border-[var(--color-v2-text)] transition-colors"
              >
                CODE →
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </article>
  );
}

/**
 * Pixel-styled visual placeholder for each chapter. Replace with real imagery later.
 */
function ChapterVisual({ chapter }: { chapter: Chapter }) {
  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden border border-[var(--color-v2-muted)]/20"
      style={{ backgroundColor: 'var(--color-v2-surface)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 70%, ${chapter.tint}66 0%, transparent 55%), linear-gradient(135deg, ${chapter.tint}30 0%, transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 4px)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0 1px, transparent 1px 3px)',
        }}
      />
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:p-10 text-center">
        <div
          className="text-[11px] tracking-[0.3em] text-[var(--color-v2-text)]/70 mb-3"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          ▸ THUMBNAIL · TODO
        </div>
        <div
          className="text-3xl md:text-5xl tracking-tight text-[var(--color-v2-text)]"
          style={{
            fontFamily: 'var(--font-family-pixel-v2)',
            fontWeight: 400,
            textShadow: `0 0 24px ${chapter.tint}`,
          }}
        >
          {chapter.title}
        </div>
      </div>
    </div>
  );
}
