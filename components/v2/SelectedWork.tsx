'use client';

import { chapters } from '@/data/v2-chapters';
import ProjectChapter from './ProjectChapter';
import Section from './Section';

export default function SelectedWork() {
  return (
    <div id="work">
      <Section marker="§ II" label="SELECTED WORK">
        <div className="text-center">
          <h2
            className="text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-[var(--color-v2-text)] mb-6 max-w-3xl mx-auto"
            style={{
              fontFamily: 'var(--font-family-pixel-v2)',
              fontWeight: 400,
            }}
          >
            FOUR THINGS I MADE WHILE FIGURING IT OUT.
          </h2>
          <p className="text-base md:text-lg text-[var(--color-v2-text)]/70 max-w-2xl mx-auto">
            Read these as chapters, not as a portfolio grid. Each one taught me something I
            couldn&apos;t have learned by reading about it.
          </p>
        </div>
      </Section>

      {/* Chapter list */}
      <div className="-mt-12 md:-mt-16">
        {chapters.map((chapter) => (
          <ProjectChapter key={chapter.numeral} chapter={chapter} />
        ))}
      </div>
    </div>
  );
}
