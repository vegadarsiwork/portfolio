'use client';

import { useState } from 'react';
import type { Chapter } from '@/data/chapters';
import StaggerWords from './StaggerWords';
import PixelReveal from './PixelReveal';
import PixelDiagram from './PixelDiagram';
import DitheredImage from './DitheredImage';
import CrtTv from './CrtTv';

function Links({ chapter }: { chapter: Chapter }) {
  if (!chapter.demo && !chapter.repo) return null;
  return (
    <span className="flex gap-4 text-sm">
      {chapter.demo && (
        <a href={chapter.demo} target="_blank" rel="noreferrer" className="link">
          Live
        </a>
      )}
      {chapter.repo && (
        <a href={chapter.repo} target="_blank" rel="noreferrer" className="link">
          Code
        </a>
      )}
    </span>
  );
}

/**
 * A featured project: title and one-line pitch across the top, then the visual
 * beside the story.
 */
export default function ProjectChapter({ chapter, index }: { chapter: Chapter; index: number }) {
  return (
    <article className="border-t border-[var(--color-v2-muted)]/20 py-12 md:py-16">
      <PixelReveal>
        <p className="meta mb-3 tabular-nums">
          Project {String(index + 1).padStart(2, '0')} / {chapter.year}
        </p>
      </PixelReveal>
      <StaggerWords as="h3" stagger={0.1} className="pxh-3 px-glow text-[var(--color-v2-text)] break-words">
        {chapter.title}
      </StaggerWords>
      <PixelReveal delay={0.1}>
        <p className="mt-3 text-lg md:text-xl leading-snug text-[var(--color-v2-text)]/70 max-w-2xl">
          {chapter.metaphor}
        </p>
      </PixelReveal>

      <div className="mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <ChapterVisual chapter={chapter} />

        <div>
          <div className="space-y-4 text-[15px] md:text-base leading-relaxed text-[var(--color-v2-text)]/80">
            {chapter.story.map((p, i) => (
              <PixelReveal key={i}>
                <p>{p}</p>
              </PixelReveal>
            ))}
          </div>
          <PixelReveal className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-3">
            <span className="meta">{chapter.meta}</span>
            <Links chapter={chapter} />
          </PixelReveal>
        </div>
      </div>
    </article>
  );
}

/** A project that gets one line instead of a chapter. */
export function ProjectRow({ chapter }: { chapter: Chapter }) {
  return (
    <PixelReveal>
      <div className="border-t border-[var(--color-v2-muted)]/20 py-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-8 gap-y-2 md:items-baseline">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-medium text-[var(--color-v2-text)]">{chapter.title}</h3>
            <span className="meta tabular-nums">{chapter.year}</span>
          </div>
          <p className="mt-1 text-sm md:text-[15px] leading-relaxed text-[var(--color-v2-text)]/70 max-w-2xl">
            {chapter.metaphor}
          </p>
          <p className="meta mt-2">{chapter.meta}</p>
        </div>
        <Links chapter={chapter} />
      </div>
    </PixelReveal>
  );
}

/**
 * Project visual, in order of preference: `chapter.image` (a screenshot under
 * /public, shown through a dither filter that clears on hover), then
 * `chapter.diagram` (an animated pixel diagram), then a plain title-card so a
 * chapter never looks unfinished.
 */
function ChapterVisual({ chapter }: { chapter: Chapter }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(chapter.image) && !imgFailed;

  return (
    <div>
      <CrtTv tint={chapter.tint}>
        {showImage ? (
          <DitheredImage
            src={chapter.image as string}
            alt={`${chapter.title} — screenshot`}
            onError={() => setImgFailed(true)}
          />
        ) : chapter.diagram ? (
          <PixelDiagram kind={chapter.diagram} tint={chapter.tint} label={`${chapter.title} — ${chapter.caption}`} />
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <span className="pxh-3" style={{ color: chapter.tint }}>
              {chapter.title}
            </span>
          </div>
        )}
      </CrtTv>
      <p className="mt-3 text-sm text-[var(--color-v2-muted)]">{chapter.caption}</p>
    </div>
  );
}
