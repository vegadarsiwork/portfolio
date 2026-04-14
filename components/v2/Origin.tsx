'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Section from './Section';
import StaggerWords from './StaggerWords';

const callouts = [
  { label: 'CURRENTLY', value: 'GAME DEV INTERN · LINCHPIN' },
  { label: 'STUDYING', value: 'B.TECH CSE · NIAT · 8.1 CGPA' },
  { label: 'BASED IN', value: 'INDIA' },
  { label: 'STACK', value: 'TS · MERN · PY · ML' },
];

export default function Origin() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20%' });

  return (
    <Section id="origin" marker="§ I" label="ORIGIN" width="wide">
      <div ref={ref} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Story column */}
        <div className="lg:col-span-8 space-y-6 text-[var(--color-v2-text)]/90">
          <StaggerWords
            as="p"
            stagger={0.12}
            className="text-2xl md:text-4xl leading-tight text-[var(--color-v2-text)]"
            style={{
              fontFamily: 'var(--font-family-display-v2)',
              fontWeight: 500,
              textShadow: '0 0 24px color-mix(in srgb, var(--color-v2-orange) 25%, transparent)',
            }}
          >
            I started by accident.
          </StaggerWords>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-base md:text-lg leading-relaxed max-w-2xl"
          >
            I&apos;m a second-year CSE student at{' '}
            <span className="text-[var(--color-v2-text)]">NIAT</span> (8.1 CGPA), currently
            a <span className="text-[var(--color-v2-orange)]">Full Stack Game Dev Intern</span> at
            Linchpin Soft Solutions. I build AI-powered web apps and high-performance digital tools
            — somewhere between{' '}
            <span className="text-[var(--color-v2-muted)]">someone who codes</span> and someone who{' '}
            <span className="text-[var(--color-v2-orange)]">ships things</span>.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base md:text-lg leading-relaxed max-w-2xl"
          >
            Before all this I led my school&apos;s robotics team to the FLL National Championships,
            founded a chess club, and studied CS and Physics through the IB Diploma at Aga Khan
            Academy. In 2024 I went deep on hackathons and freelance work — shipped five+ full-stack
            apps and reached the finals of a couple of AI hackathons that taught me what I still
            don&apos;t know.
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
