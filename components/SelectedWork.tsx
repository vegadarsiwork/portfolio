'use client';

import { chapters } from '@/data/chapters';
import ProjectChapter from './ProjectChapter';
import Section from './Section';
import StaggerWords from './StaggerWords';

export default function SelectedWork() {
  return (
    <div id="work">
      <Section marker="III" label="SELECTED WORK">
        <div className="text-center">
          <StaggerWords
            className="text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-[var(--color-v2-text)] mb-6 max-w-3xl mx-auto"
            style={{
              fontFamily: 'var(--font-family-display-v2)',
              fontWeight: 500,
            }}
          >
THINGS I MADE WHILE FIGURING IT OUT.
          </StaggerWords>
          <p className="text-base md:text-lg text-[var(--color-v2-text)]/70 max-w-2xl mx-auto">
            Projects I actually shipped — plus the one I&apos;m building now. Short
            notes on what each one is, not a grid of screenshots.
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
