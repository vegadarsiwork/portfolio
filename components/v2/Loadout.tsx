'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Section from './Section';

const loadout: { category: string; items: { name: string; level: number }[] }[] = [
  {
    category: 'LANGUAGES',
    items: [
      { name: 'TYPESCRIPT', level: 4 },
      { name: 'PYTHON', level: 4 },
      { name: 'JAVASCRIPT', level: 5 },
      { name: 'C / C++', level: 3 },
    ],
  },
  {
    category: 'FRAMEWORKS',
    items: [
      { name: 'REACT', level: 5 },
      { name: 'NEXT.JS', level: 4 },
      { name: 'NODE / EXPRESS', level: 4 },
      { name: 'TAILWIND', level: 5 },
    ],
  },
  {
    category: 'ML & DATA',
    items: [
      { name: 'NUMPY', level: 4 },
      { name: 'PANDAS', level: 4 },
      { name: 'SCIKIT-LEARN', level: 3 },
      { name: 'COLAB', level: 4 },
    ],
  },
  {
    category: 'DESIGN',
    items: [
      { name: 'FIGMA', level: 4 },
      { name: 'FRAMER MOTION', level: 4 },
      { name: 'PIXEL ART', level: 2 },
      { name: 'TYPE SYSTEMS', level: 3 },
    ],
  },
];

function LevelBar({ level }: { level: number }) {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-3"
          style={{
            backgroundColor: i < level ? 'var(--color-v2-orange)' : 'transparent',
            border: '1px solid var(--color-v2-orange)',
            opacity: i < level ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

export default function Loadout() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <Section id="loadout" marker="§ III" label="LOADOUT">
      <div ref={ref} className="max-w-6xl">
        <h2
          className="text-4xl md:text-6xl tracking-tight text-[var(--color-v2-text)] mb-4"
          style={{ fontFamily: 'var(--font-family-mono-head)' }}
        >
          STACK / EQUIPPED.
        </h2>
        <p className="text-base md:text-lg text-[var(--color-v2-text)]/70 max-w-2xl mb-12">
          Tools I reach for without thinking. Levels are honest, not aspirational — anything I&apos;d
          need to crack open the docs for is rated lower.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {loadout.map((group, gi) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: gi * 0.08 }}
            >
              <div
                className="text-[10px] tracking-[0.3em] text-[var(--color-v2-orange)] mb-4 pb-2 border-b border-[var(--color-v2-muted)]/20"
                style={{ fontFamily: 'var(--font-family-mono-head)' }}
              >
                ▸ {group.category}
              </div>
              <ul className="space-y-3">
                {group.items.map((item, ii) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: gi * 0.08 + ii * 0.05 + 0.15 }}
                    className="flex items-center justify-between gap-4"
                  >
                    <span
                      className="text-sm tracking-[0.1em] text-[var(--color-v2-text)]"
                      style={{ fontFamily: 'var(--font-family-mono-head)' }}
                    >
                      {item.name}
                    </span>
                    <LevelBar level={item.level} />
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
