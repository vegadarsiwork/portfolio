'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface SectionProps {
  id?: string;
  marker?: string;
  label?: string;
  children: ReactNode;
  className?: string;
  /** Max inner column width. Defaults to 5xl. */
  width?: 'narrow' | 'normal' | 'wide';
}

const WIDTH_CLASS: Record<NonNullable<SectionProps['width']>, string> = {
  narrow: 'max-w-3xl',
  normal: 'max-w-5xl',
  wide: 'max-w-6xl',
};

/**
 * Shared section wrapper — centered inner column with a CRT chapter marker.
 */
export default function Section({
  id,
  marker,
  label,
  children,
  className = '',
  width = 'normal',
}: SectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <section
      id={id}
      ref={ref}
      className={`relative py-20 md:py-40 px-5 md:px-12 ${className}`}
    >
      <div className={`${WIDTH_CLASS[width]} mx-auto`}>
        {(marker || label) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex items-center justify-center gap-3 mb-12 md:mb-16"
            style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
          >
            <span className="h-px w-12 bg-[var(--color-v2-muted)]/30" />
            {marker && (
              <span className="text-[var(--color-v2-orange)] text-xs md:text-sm tracking-[0.25em]">
                {marker}
              </span>
            )}
            {label && (
              <span className="text-[10px] md:text-xs tracking-[0.3em] text-[var(--color-v2-muted)]">
                {label}
              </span>
            )}
            <span className="h-px w-12 bg-[var(--color-v2-muted)]/30" />
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
