import type { ReactNode } from 'react';
import PixelReveal from './PixelReveal';
import StaggerWords from './StaggerWords';

interface SectionProps {
  id?: string;
  /** Two-digit position shown in the label, e.g. "02". */
  index: string;
  label: string;
  /** Pixel heading. Omit for a section that brings its own. */
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Shared section wrapper: one left-aligned column with a small label, a pixel
 * heading and an optional intro line.
 */
export default function Section({ id, index, label, title, intro, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`relative py-16 md:py-28 px-5 md:px-12 ${className}`}>
      <div className="max-w-5xl mx-auto">
        <PixelReveal>
          <p className="meta mb-5">
            <span className="text-[var(--color-v2-orange)]">{index}</span> / {label}
          </p>
        </PixelReveal>
        {title && (
          <StaggerWords className="pxh-2 px-glow text-[var(--color-v2-text)] mb-5 max-w-3xl">{title}</StaggerWords>
        )}
        {intro && <p className="text-base md:text-lg text-[var(--color-v2-text)]/60 max-w-xl">{intro}</p>}
        <div className={title || intro ? 'mt-10 md:mt-14' : ''}>{children}</div>
      </div>
    </section>
  );
}
