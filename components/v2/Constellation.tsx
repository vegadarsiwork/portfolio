'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Section from './Section';

type ClusterId = 'languages' | 'frameworks' | 'data' | 'craft';

interface SkillStar {
  id: string;
  name: string;
  level: number; // 1–5
  x: number;
  y: number;
  cluster: ClusterId;
}

const skills: SkillStar[] = [
  // THE LANGUAGES — upper left
  { id: 'ts',  name: 'TYPESCRIPT', level: 4, x: 170, y: 145, cluster: 'languages' },
  { id: 'py',  name: 'PYTHON',     level: 4, x: 250, y: 110, cluster: 'languages' },
  { id: 'js',  name: 'JAVASCRIPT', level: 5, x: 300, y: 185, cluster: 'languages' },
  { id: 'cpp', name: 'C / C++',    level: 3, x: 185, y: 225, cluster: 'languages' },

  // THE FRAMEWORKS — upper right
  { id: 'react', name: 'REACT',    level: 5, x: 690, y: 130, cluster: 'frameworks' },
  { id: 'next',  name: 'NEXT.JS',  level: 4, x: 785, y: 95,  cluster: 'frameworks' },
  { id: 'node',  name: 'NODE',     level: 4, x: 855, y: 165, cluster: 'frameworks' },
  { id: 'tw',    name: 'TAILWIND', level: 5, x: 745, y: 205, cluster: 'frameworks' },

  // THE DATA — lower left
  { id: 'np',    name: 'NUMPY',    level: 4, x: 150, y: 390, cluster: 'data' },
  { id: 'pd',    name: 'PANDAS',   level: 4, x: 240, y: 415, cluster: 'data' },
  { id: 'skl',   name: 'SKLEARN',  level: 3, x: 185, y: 475, cluster: 'data' },
  { id: 'colab', name: 'COLAB',    level: 4, x: 285, y: 460, cluster: 'data' },

  // THE CRAFT — lower right
  { id: 'fig',  name: 'FIGMA',     level: 4, x: 685, y: 405, cluster: 'craft' },
  { id: 'mot',  name: 'MOTION',    level: 4, x: 795, y: 390, cluster: 'craft' },
  { id: 'pix',  name: 'PIXEL ART', level: 2, x: 855, y: 460, cluster: 'craft' },
  { id: 'type', name: 'TYPE',      level: 3, x: 725, y: 478, cluster: 'craft' },
];

const edges: [string, string][] = [
  // languages
  ['ts', 'js'], ['ts', 'cpp'], ['js', 'py'], ['py', 'ts'],
  // frameworks
  ['react', 'next'], ['next', 'node'], ['react', 'tw'], ['tw', 'next'],
  // data
  ['np', 'pd'], ['pd', 'skl'], ['skl', 'colab'], ['pd', 'colab'],
  // craft
  ['fig', 'mot'], ['mot', 'pix'], ['fig', 'type'], ['mot', 'type'],
  // bridges
  ['js', 'react'], ['pd', 'fig'],
];

const clusters: { id: ClusterId; label: string; x: number; y: number; tint: string }[] = [
  { id: 'languages',  label: 'THE LANGUAGES',  x: 230, y: 65,  tint: '#5b8def' },
  { id: 'frameworks', label: 'THE FRAMEWORKS', x: 775, y: 50,  tint: '#ff8c42' },
  { id: 'data',       label: 'THE DATA',       x: 215, y: 535, tint: '#b06ab3' },
  { id: 'craft',      label: 'THE CRAFT',      x: 775, y: 540, tint: '#ffd97a' },
];

function radius(level: number) {
  return 3 + level;
}

export default function Constellation() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const [hovered, setHovered] = useState<string | null>(null);

  const hoveredSkill = skills.find((s) => s.id === hovered) ?? null;
  const hoveredEdges = hovered
    ? edges.filter(([a, b]) => a === hovered || b === hovered)
    : [];
  const hoveredNeighbors = new Set<string>(hoveredEdges.flat());

  return (
    <Section id="stack" marker="§ III" label="STACK" width="wide">
      <div ref={ref} className="text-center">
        <h2
          className="text-4xl md:text-6xl lg:text-7xl tracking-tight text-[var(--color-v2-text)] mb-5"
          style={{ fontFamily: 'var(--font-family-pixel-v2)', fontWeight: 600 }}
        >
          THE CONSTELLATION.
        </h2>
        <p className="text-base md:text-lg text-[var(--color-v2-text)]/70 max-w-2xl mx-auto mb-14">
          Every tool I reach for without thinking, mapped as stars. Hover a star to see the lines
          it belongs to. Brightness is mastery, not importance.
        </p>

        {/* SVG constellation */}
        <div className="relative mx-auto max-w-5xl aspect-[10/6] border border-[var(--color-v2-muted)]/15 bg-[var(--color-v2-surface)]/30">
          <svg
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full"
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"  stopColor="#fff" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#fff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="star-glow-hot" cx="50%" cy="50%" r="50%">
                <stop offset="0%"  stopColor="#ff8c42" stopOpacity="1" />
                <stop offset="40%" stopColor="#ff8c42" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ff8c42" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Edges (lines) — render behind stars */}
            {edges.map(([aId, bId], i) => {
              const a = skills.find((s) => s.id === aId);
              const b = skills.find((s) => s.id === bId);
              if (!a || !b) return null;
              const active =
                hovered !== null && (aId === hovered || bId === hovered);
              const base = hovered && !active ? 0.08 : 0.22;
              return (
                <motion.line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={active ? '#ff8c42' : '#f5e9d8'}
                  strokeWidth={active ? 1.5 : 1}
                  strokeOpacity={active ? 0.9 : base}
                  strokeDasharray={active ? '0' : '3 4'}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{ duration: 1.2, delay: 0.4 + i * 0.04, ease: 'easeOut' }}
                  style={{ transition: 'stroke 0.2s, stroke-opacity 0.2s, stroke-width 0.2s' }}
                />
              );
            })}

            {/* Cluster labels */}
            {clusters.map((c, i) => (
              <motion.text
                key={c.id}
                x={c.x}
                y={c.y}
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                style={{
                  fontFamily: 'var(--font-family-pixel-v2)',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  fill: c.tint,
                  filter: `drop-shadow(0 0 6px ${c.tint}88)`,
                }}
              >
                {c.label}
              </motion.text>
            ))}

            {/* Stars */}
            {skills.map((s, i) => {
              const isHovered = s.id === hovered;
              const isNeighbor = hoveredNeighbors.has(s.id);
              const isDimmed = hovered !== null && !isHovered && !isNeighbor;
              const r = radius(s.level);
              return (
                <motion.g
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={inView ? { opacity: isDimmed ? 0.3 : 1, scale: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
                  onMouseEnter={() => setHovered(s.id)}
                  onFocus={() => setHovered(s.id)}
                  onBlur={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                  tabIndex={0}
                >
                  {/* Glow halo */}
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={isHovered ? r * 4 : r * 2.5}
                    fill={isHovered ? 'url(#star-glow-hot)' : 'url(#star-glow)'}
                    style={{ transition: 'r 0.2s' }}
                  />
                  {/* Star core */}
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={isHovered ? r + 1 : r}
                    fill={isHovered ? '#ff8c42' : '#f5e9d8'}
                    style={{ transition: 'r 0.2s, fill 0.2s' }}
                  />
                  {/* Label below */}
                  <text
                    x={s.x}
                    y={s.y + r + 14}
                    textAnchor="middle"
                    style={{
                      fontFamily: 'var(--font-family-pixel-v2)',
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: '0.15em',
                      fill: isHovered ? '#ff8c42' : isDimmed ? '#8a7da0' : '#f5e9d8',
                      transition: 'fill 0.2s',
                      pointerEvents: 'none',
                    }}
                  >
                    {s.name}
                  </text>
                </motion.g>
              );
            })}
          </svg>

          {/* Hover detail card (top-left corner of SVG container) */}
          <motion.div
            initial={false}
            animate={{
              opacity: hoveredSkill ? 1 : 0,
              y: hoveredSkill ? 0 : 8,
            }}
            transition={{ duration: 0.25 }}
            className="absolute top-4 left-4 md:top-6 md:left-6 pointer-events-none border border-[var(--color-v2-orange)]/40 bg-[var(--color-v2-bg)]/85 backdrop-blur-sm px-4 py-3 text-left min-w-[180px]"
            style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
          >
            <div className="text-[9px] tracking-[0.3em] text-[var(--color-v2-muted)] mb-1">
              ▸ {hoveredSkill ? clusters.find((c) => c.id === hoveredSkill.cluster)?.label : '—'}
            </div>
            <div className="text-sm tracking-[0.1em] text-[var(--color-v2-orange)] mb-2">
              {hoveredSkill?.name ?? '—'}
            </div>
            <div className="flex gap-[3px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-4"
                  style={{
                    backgroundColor:
                      hoveredSkill && i < hoveredSkill.level
                        ? 'var(--color-v2-orange)'
                        : 'transparent',
                    border: '1px solid var(--color-v2-orange)',
                    opacity: hoveredSkill && i < hoveredSkill.level ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <div
          className="mt-4 text-[10px] tracking-[0.3em] text-[var(--color-v2-muted)]"
          style={{ fontFamily: 'var(--font-family-pixel-v2)' }}
        >
          ── HOVER A STAR TO CHART ITS LINES ──
        </div>
      </div>
    </Section>
  );
}
