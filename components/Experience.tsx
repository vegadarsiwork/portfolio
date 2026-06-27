'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Section from './Section';
import StaggerWords from './StaggerWords';

interface Role {
  title: string;
  org: string;
  type: string;
  dates: string;
  duration: string;
  bullets: string[];
}

const roles: Role[] = [
  {
    title: 'Full Stack Web Developer',
    org: 'Linchpin Soft Solutions Pvt. Ltd.',
    type: 'INTERN',
    dates: 'APR — JUN 2026',
    duration: '3 MOS',
    bullets: [
      'Built and shipped an internal marketing-ops dashboard now used daily — a superadmin console, role-scoped client dashboards, and an influencer marketplace.',
      'Owned the backend surface: Postgres data model, role-scoped auth, and idempotent cron reminders, with media offloaded so the app servers stay stateless.',
      'Shipped to production on Next.js 16 / React 19 — wiring in an AI script pipeline (OpenRouter) and a media pipeline (UploadThing) without breaking the people logging in every day.',
    ],
  },
];

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <Section id="experience" marker="II" label="EXPERIENCE" width="normal">
      <div ref={ref} className="text-center">
        <StaggerWords
          className="text-4xl md:text-6xl lg:text-7xl tracking-tight text-[var(--color-v2-text)] mb-5"
          style={{ fontFamily: 'var(--font-family-display-v2)', fontWeight: 500 }}
        >
          THE DAY JOB.
        </StaggerWords>
        <p className="text-base md:text-lg text-[var(--color-v2-text)]/70 max-w-2xl mx-auto mb-12">
          Three months on a real team, shipping to people who log in every day.
        </p>

        {/* Terminal block */}
        <div
          className="border border-[var(--color-v2-muted)]/20 bg-[var(--color-v2-surface)]/50 text-left"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          {/* Terminal header */}
          <div className="flex items-center justify-between text-[9px] tracking-[0.25em] text-[var(--color-v2-muted)] px-5 md:px-6 py-3 border-b border-[var(--color-v2-muted)]/15">
            <span>~/.vega/experience.log</span>
            <span className="text-[var(--color-v2-orange)]">* {roles.length} ROLE</span>
          </div>

          <div className="divide-y divide-[var(--color-v2-muted)]/10">
            {roles.map((role, i) => (
              <motion.div
                key={role.org + role.title}
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.15 + i * 0.1 }}
                className="px-5 md:px-8 py-7 md:py-9"
              >
                {/* Title row */}
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-1.5">
                  <h3
                    className="text-2xl md:text-3xl tracking-tight text-[var(--color-v2-text)]"
                    style={{ fontFamily: 'var(--font-family-display-v2)', fontWeight: 500 }}
                  >
                    {role.title}
                  </h3>
                  <span className="text-[10px] md:text-xs tracking-[0.25em] text-[var(--color-v2-orange)] tabular-nums">
                    {role.dates}{' '}
                    <span className="text-[var(--color-v2-muted)]/60">/ {role.duration}</span>
                  </span>
                </div>

                {/* Org row */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-5">
                  <span
                    className="text-sm md:text-base text-[var(--color-v2-text)]/90"
                    style={{ fontFamily: 'var(--font-family-body-v2)' }}
                  >
                    {role.org}
                  </span>
                  <span className="text-[10px] tracking-[0.25em] text-[var(--color-v2-muted)]">
                    [{role.type}]
                  </span>
                </div>

                {/* Bullets */}
                <ul className="space-y-2.5">
                  {role.bullets.map((b, bi) => (
                    <li
                      key={bi}
                      className="grid grid-cols-[auto_1fr] gap-x-3 text-sm md:text-[15px] leading-relaxed text-[var(--color-v2-text)]/85"
                      style={{ fontFamily: 'var(--font-family-body-v2)' }}
                    >
                      <span className="text-[var(--color-v2-orange)] select-none">-</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="px-5 md:px-6 py-3 border-t border-[var(--color-v2-muted)]/15 text-[10px] tracking-[0.25em] text-[var(--color-v2-muted)] flex items-center justify-between"
          >
            <span>EOF / more soon</span>
            <span className="text-[var(--color-v2-orange)] animate-pulse">|</span>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
