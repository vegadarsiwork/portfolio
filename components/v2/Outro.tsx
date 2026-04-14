'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const links = [
  { label: 'EMAIL',    value: 'vegadarsiwork@gmail.com', href: 'mailto:vegadarsiwork@gmail.com' },
  { label: 'GITHUB',   value: 'github.com/vegadarsiwork', href: 'https://github.com/vegadarsiwork' },
  { label: 'LINKEDIN', value: 'linkedin.com/in/vega-darsi', href: 'https://www.linkedin.com/in/vega-darsi/' },
];

export default function Outro() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <section
      id="contact"
      ref={ref}
      className="relative px-6 md:px-12 pt-32 md:pt-48 pb-16 border-t border-[var(--color-v2-muted)]/15"
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Marker */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-12"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          <span className="h-px w-12 bg-[var(--color-v2-muted)]/30" />
          <span className="text-[var(--color-v2-orange)] text-xs tracking-[0.25em]">§ VII</span>
          <span className="text-[10px] tracking-[0.3em] text-[var(--color-v2-muted)]">OUTRO</span>
          <span className="h-px w-12 bg-[var(--color-v2-muted)]/30" />
        </motion.div>

        {/* Big pixel CTA */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-[clamp(40px,9vw,140px)] leading-[0.9] tracking-tight text-[var(--color-v2-text)] mb-10"
          style={{
            fontFamily: 'var(--font-family-footer-v2)',
            fontWeight: 500,
            textShadow: '0 0 30px color-mix(in srgb, var(--color-v2-orange) 35%, transparent), 0 0 60px color-mix(in srgb, var(--color-v2-orange) 20%, transparent)',
          }}
        >
          LET&apos;S BUILD<br />
          <span className="text-[var(--color-v2-orange)]">SOMETHING.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg md:text-xl text-[var(--color-v2-text)]/80 max-w-2xl mx-auto mb-12"
        >
          Internships, collaborations, hackathon teams, or just a long email about a weird idea —
          all welcome. I read everything.
        </motion.p>

        {/* Contact links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          {links.map((l, i) => (
            <motion.a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
              className="group block border border-[var(--color-v2-muted)]/20 hover:border-[var(--color-v2-orange)] p-5 transition-colors"
            >
              <div
                className="text-[10px] tracking-[0.3em] text-[var(--color-v2-muted)] group-hover:text-[var(--color-v2-orange)] mb-2 transition-colors"
                style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
              >
                ▸ {l.label}
              </div>
              <div className="text-sm md:text-base text-[var(--color-v2-text)] group-hover:text-[var(--color-v2-orange)] transition-colors break-all">
                {l.value}
              </div>
            </motion.a>
          ))}
        </div>

        {/* Footer signoff */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-24 pt-8 border-t border-[var(--color-v2-muted)]/15 flex flex-wrap items-center justify-between gap-3 text-[10px] tracking-[0.25em] text-[var(--color-v2-muted)]"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          <span>VEGA DARSI · {new Date().getFullYear()}</span>
          <span className="text-[var(--color-v2-orange)]">▮ END OF TRANSMISSION</span>
        </motion.div>
      </div>
    </section>
  );
}
