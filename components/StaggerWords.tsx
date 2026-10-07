'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { createElement, useRef, type CSSProperties, type ReactNode } from 'react';

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';

interface Props {
  /** Plain string OR multiple lines as an array. */
  children: string | string[];
  className?: string;
  style?: CSSProperties;
  /** Initial delay before the first word animates */
  delay?: number;
  /** Per-word delay. Default 0.08. */
  stagger?: number;
  /** HTML tag to render. */
  as?: Tag;
  /** Optional fragment that renders before the first word (e.g. punctuation, prefix). */
  prefix?: ReactNode;
}

/**
 * Animates a heading word-by-word as it enters the viewport. Each word fades
 * up into place; the whole thing once-only via useInView.
 */
export default function StaggerWords({
  children,
  className,
  style,
  delay = 0,
  stagger = 0.08,
  as = 'h2',
  prefix,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  // Bottom-only margin: a heading that lands near the top of the screen after a
  // jump (anchor link, restored scroll) still counts as in view.
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const prefersReducedMotion = useReducedMotion();

  const lines = Array.isArray(children) ? children : [children];

  let wordIndex = 0;
  const lineNodes = lines.map((line, li) => {
    const words = line.split(' ');
    const wordSpans = words.map((word, i) => {
      const idx = wordIndex++;
      return (
        <motion.span
          key={`${li}-${i}`}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: prefersReducedMotion ? 0.01 : 0.7,
            delay: prefersReducedMotion ? 0 : delay + idx * stagger,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="inline-block"
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      );
    });
    return (
      <span key={li} className="block">
        {li === 0 && prefix}
        {wordSpans}
      </span>
    );
  });

  return createElement(as, { ref, className, style }, lineNodes);
}
