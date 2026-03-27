import {
  SiReact,
  SiTypescript,
  SiHtml5,
  SiTailwindcss,
  SiJavascript,
  SiNodedotjs,
  SiMongodb,
  SiFramer,
  SiOpenai,
  SiPython,
  SiGit,
  SiExpress,
} from 'react-icons/si';
import { FaCode } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { useState } from 'react';

type Skill = {
  name: string;
  level: 'Expert' | 'Advanced' | 'Intermediate';
  desc: string;
  size: string;
  icon: IconType;
  category: 'Core' | 'Build & Ship' | 'AI & Data';
};

const skills: Skill[] = [
  // Core stack
  { name: 'React & Next.js', level: 'Expert', desc: 'Building modern web applications', size: 'lg:col-span-2 lg:row-span-2', icon: SiReact, category: 'Core' },
  { name: 'TypeScript', level: 'Advanced', desc: 'Type-safe development', size: 'lg:col-span-1 lg:row-span-1', icon: SiTypescript, category: 'Core' },
  { name: 'Node.js', level: 'Advanced', desc: '', size: 'lg:col-span-1 lg:row-span-1', icon: SiNodedotjs, category: 'Core' },
  { name: 'REST APIs', level: 'Advanced', desc: '', size: 'lg:col-span-1 lg:row-span-1', icon: FaCode, category: 'Build & Ship' },
  { name: 'HTML & CSS', level: 'Expert', desc: 'Semantic markup and styling', size: 'lg:col-span-2 lg:row-span-1', icon: SiHtml5, category: 'Core' },
  { name: 'MongoDB', level: 'Intermediate', desc: '', size: 'lg:col-span-1 lg:row-span-1', icon: SiMongodb, category: 'Build & Ship' },

  // Product and tooling
  { name: 'JavaScript', level: 'Expert', desc: 'ES6+ and modern JS', size: 'lg:col-span-2 lg:row-span-2', icon: SiJavascript, category: 'Core' },
  { name: 'Tailwind CSS', level: 'Expert', desc: '', size: 'lg:col-span-1 lg:row-span-1', icon: SiTailwindcss, category: 'Build & Ship' },
  { name: 'Express.js', level: 'Advanced', desc: '', size: 'lg:col-span-1 lg:row-span-1', icon: SiExpress, category: 'Build & Ship' },
  { name: 'Framer Motion', level: 'Advanced', desc: '', size: 'lg:col-span-1 lg:row-span-1', icon: SiFramer, category: 'Build & Ship' },
  { name: 'Git', level: 'Advanced', desc: '', size: 'lg:col-span-1 lg:row-span-1', icon: SiGit, category: 'Build & Ship' },

  // New focus areas
  {
    name: 'Full Stack Web',
    level: 'Expert',
    desc: 'MERN stack, TypeScript, and REST APIs',
    size: 'lg:col-span-2 lg:row-span-1',
    icon: SiReact,
    category: 'Build & Ship',
  },
  {
    name: 'Game Development',
    level: 'Advanced',
    desc: 'Full-stack logic and interactive mechanics',
    size: 'lg:col-span-1 lg:row-span-1',
    icon: FaCode,
    category: 'Build & Ship',
  },
  {
    name: 'AI & Machine Learning',
    level: 'Advanced',
    desc: 'Building AI agents, LLM integration, and fine-tuning',
    size: 'lg:col-span-2 lg:row-span-1',
    icon: SiOpenai,
    category: 'AI & Data',
  },
  {
    name: 'Python & Data',
    level: 'Advanced',
    desc: 'Predictive modeling and statistical analysis',
    size: 'lg:col-span-2 lg:row-span-1',
    icon: SiPython,
    category: 'AI & Data',
  },
];

const mobileRails: Array<{ title: string; category: Skill['category'] }> = [
  { title: 'core stack', category: 'Core' },
  { title: 'build & ship', category: 'Build & Ship' },
  { title: 'ai & data', category: 'AI & Data' },
];

const levelStyles: Record<string, string> = {
  Expert: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200',
  Advanced: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200',
  Intermediate: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
};

const accentBands = [
  'from-accent-1/22 to-transparent',
  'from-accent-2/18 to-transparent',
  'from-amber-300/16 to-transparent',
];

export default function Skills() {
  const [pausedRail, setPausedRail] = useState<number | null>(null);

  return (
    <section id="skills" className="relative overflow-hidden bg-black py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-accent-1/10 via-accent-2/5 to-transparent" />
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center font-monoHead text-3xl text-white md:mb-12 md:text-4xl">skills & expertise</h2>

        <div className="space-y-7 sm:hidden">
          {mobileRails.map((rail, railIndex) => {
            const railSkills = skills.filter((skill) => skill.category === rail.category);
            const loopSkills = [...railSkills, ...railSkills];
            const isReverse = railIndex % 2 === 1;
            const durationSeconds = 22 + railSkills.length * 2;

            return (
              <div key={rail.title} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-monoHead text-xs uppercase tracking-[0.12em] text-white/70">{rail.title}</h3>
                  <span className="text-[11px] text-white/45">auto</span>
                </div>

                <div
                  className="-mx-4 overflow-hidden px-4"
                  onPointerDown={() => setPausedRail(railIndex)}
                  onPointerUp={() => setPausedRail(null)}
                  onPointerCancel={() => setPausedRail(null)}
                  onPointerLeave={() => setPausedRail(null)}
                >
                  <div
                    className="flex w-max gap-3 pb-1"
                    style={{
                      animation: `${isReverse ? 'skills-rail-right' : 'skills-rail-left'} ${durationSeconds}s linear infinite`,
                      animationPlayState: pausedRail === railIndex ? 'paused' : 'running',
                    }}
                  >
                    {loopSkills.map((skill, skillIndex) => {
                      const AccentIcon = skill.icon;
                      const accent = (railIndex + skillIndex) % 2 === 0 ? 'from-accent-1/18 to-transparent' : 'from-accent-2/14 to-transparent';

                      return (
                        <article
                          key={`${rail.title}-${skill.name}-${skillIndex}`}
                          className="group relative w-[78vw] max-w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#111]/90 p-4 shadow-xl"
                        >
                          <div className={`pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b ${accent}`} />
                          <div className="mb-3 flex items-center justify-between">
                            <AccentIcon className="text-xl text-white" />
                            <span className={`inline-block rounded-full border px-2.5 py-1 text-[11px] ${levelStyles[skill.level] ?? 'border-white/20 bg-white/10 text-gray-200'}`}>
                              {skill.level}
                            </span>
                          </div>
                          <h4 className="mb-2 text-base font-semibold text-white">{skill.name}</h4>
                          <p className="text-xs leading-relaxed text-gray-400">{skill.desc || 'Hands-on implementation across production-ready projects.'}</p>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* True Bento Grid - Irregular, Asymmetric Layout */}
        <div className="mx-auto hidden max-w-6xl grid-cols-1 auto-rows-[140px] gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-5 lg:auto-rows-[150px]">
          {skills.map((skill, index) => (
            <div
              key={skill.name}
              className={`
                group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5
                cursor-pointer transition-all duration-300
                hover:scale-[1.02] hover:border-white/25 hover:bg-white/10 hover:shadow-lg
                flex flex-col
                ${skill.size}
              `}
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b ${accentBands[index % accentBands.length]}`} />

              {/* Icon */}
              <div className="mb-auto text-2xl text-white">
                <skill.icon />
              </div>

              {/* Content at bottom */}
              <div className="mt-auto">
                {/* Skill Name */}
                <h3 className="mb-1 text-base font-bold leading-tight text-white">
                  {skill.name}
                </h3>

                {/* Description (only if exists) */}
                {skill.desc && (
                  <p className="mb-2 text-xs leading-snug text-gray-400">{skill.desc}</p>
                )}

                {/* Level Badge */}
                <span className={`inline-block rounded-full border px-2.5 py-1 text-xs ${levelStyles[skill.level] ?? 'border-white/20 bg-white/10 text-gray-200'}`}>
                  {skill.level}
                </span>
              </div>

              {/* Hover gradient effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-1/0 to-accent-2/0 group-hover:from-accent-1/5 group-hover:to-accent-2/5 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes skills-rail-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes skills-rail-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
