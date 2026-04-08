'use client';
import { projects } from '@/data/projects';

function ProjectCard({
  project,
  index,
}: {
  project: typeof projects[0];
  index: number;
}) {
  const chipTone = index % 2 === 0
    ? 'border-accent-1/20 bg-accent-1/10 text-[#9fffee]'
    : 'border-accent-2/20 bg-accent-2/10 text-[#ffb8e0]';

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/90 p-5 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-[#171717]/90 md:p-8"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="font-monoHead text-xs tracking-wide text-white/60">project {String(index + 1).padStart(2, '0')}</span>
        <span className="h-px w-14 bg-gradient-to-r from-white/30 to-transparent" />
      </div>

      <div className="mb-4 text-xl font-bold text-white md:text-2xl">{project.title}</div>

      <div className="transition-all duration-300">
        <div className="mb-6 max-w-3xl text-sm leading-relaxed text-gray-300 md:text-base">{project.description}</div>

        <div className="mb-6 flex flex-wrap gap-3">
          {project.tech.map(t => (
            <span key={t} className={`rounded-full border px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm ${chipTone}`}>
              {t}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 md:gap-4">
          {project.demo && (
            <a
              className="rounded-lg bg-gradient-to-r from-accent-1 to-accent-2 px-5 py-2.5 text-sm font-medium text-black transition hover:opacity-90 md:px-6 md:py-3"
              href={project.demo}
              target="_blank"
              rel="noreferrer"
            >
              Live Demo
            </a>
          )}
          {project.repo && (
            <a
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm transition hover:bg-white/5 md:px-6 md:py-3"
              href={project.repo}
              target="_blank"
              rel="noreferrer"
            >
              View Code
            </a>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 transition group-hover:ring-white/10" />
    </article>
  );
}

export default function ProjectsGrid() {
  return (
    <section id="projects" className="relative pb-20 pt-20 md:pt-32 border-t border-white/10">
      <div className="absolute inset-0 -z-10 bg-black" />

      <div className="container relative mx-auto px-4">
        <div className="mb-12 py-5 md:mb-20 md:py-6">
          <h2 className="text-center font-monoHead text-3xl text-white md:text-4xl">featured projects</h2>
        </div>

        {/* Mobile: simple stacked cards with full content */}
        <div className="mx-auto mb-8 max-w-6xl sm:hidden">
          <div className="mb-4 flex items-center justify-between px-2">
            <span className="font-monoHead text-xs text-white/60">projects</span>
            <span className="text-xs text-white/50">all details visible</span>
          </div>

          <div className="space-y-4">
            {projects.map((project, index) => {
              return (
                <div key={project.id} className="relative transition-all duration-300">
                  <ProjectCard
                    project={project}
                    index={index}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="pointer-events-none absolute bottom-8 left-1/2 top-8 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent md:block" />

          <div className="hidden space-y-7 sm:block md:space-y-10">
            {projects.map((project, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={project.id}
                  className={`relative flex ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}
                >
                  <div className="absolute left-1/2 top-10 z-20 hidden h-3 w-3 -translate-x-1/2 rounded-full border border-white/20 bg-black md:block" />
                  <div className="w-full md:w-[46%]">
                    <ProjectCard project={project} index={index} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
