'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Section from './Section';

const callouts = [
  { label: 'CURRENTLY', value: 'STUDENT BUILDER' },
  { label: 'BASED IN', value: 'INDIA' },
  { label: 'STARTED', value: '2021' },
  { label: 'STACK', value: 'TS · PY · ML' },
];

export default function Origin() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20%' });

  return (
    <Section id="origin" marker="§ I" label="ORIGIN" width="wide">
      <div ref={ref} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Story column */}
        <div className="lg:col-span-8 space-y-6 text-[var(--color-v2-text)]/90">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-2xl md:text-4xl leading-tight text-[var(--color-v2-text)]"
            style={{
              fontFamily: 'var(--font-family-pixel-v2)',
              textShadow: '0 0 24px color-mix(in srgb, var(--color-v2-orange) 25%, transparent)',
            }}
          >
            I started by accident.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-base md:text-lg leading-relaxed max-w-2xl"
          >
            I opened a code editor for a school assignment in 2021 and didn&apos;t close it for the
            next three years. Somewhere between the first <em>Hello World</em> and a hackathon
            trophy I stopped thinking of myself as{' '}
            <span className="text-[var(--color-v2-muted)]">someone who codes</span> and started
            thinking of myself as someone who{' '}
            <span className="text-[var(--color-v2-orange)]">builds things</span>.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base md:text-lg leading-relaxed max-w-2xl"
          >
            Today I sit in the gap between design and engineering — close enough to ML to train a
            model, close enough to a Figma file to know why a button feels wrong. I&apos;m a
            student. I don&apos;t have all the answers yet. That&apos;s also the point.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-base md:text-lg leading-relaxed max-w-2xl text-[var(--color-v2-muted)]"
          >
            What follows is a small archive of things I&apos;ve made while figuring it out.
          </motion.p>
        </div>

        {/* Pixel callouts column — stacked vertical sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {callouts.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, x: 12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
              className="border-l-2 border-[var(--color-v2-orange)] pl-4 py-1"
              style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
            >
              <div className="text-[9px] tracking-[0.3em] text-[var(--color-v2-muted)] mb-1">
                {c.label}
              </div>
              <div className="text-sm tracking-[0.1em] text-[var(--color-v2-text)]">
                {c.value}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
