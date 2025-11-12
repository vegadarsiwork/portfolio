'use client';
import { projects } from '@/data/projects';

function ProjectCard({ project, index }: { project: typeof projects[0], index: number }) {
  // Alternate between dark gray and darker gray
  const bgColor = index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#0f0f0f]';
  
  return (
    <article
      style={{
        top: `${160 + index * 80}px`,
      }}
      className={`sticky ${bgColor} rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-xl overflow-hidden p-8 h-[500px]`}
    >
      <div className="mb-4 font-bold text-white text-2xl">{project.title}</div>
      <div className="text-base text-gray-300 mb-6 leading-relaxed max-w-3xl">{project.description}</div>
      <div className="flex gap-3 flex-wrap mb-6">
        {project.tech.map(t => (
          <span key={t} className="text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10">
            {t}
          </span>
        ))}
      </div>
      <div className="flex gap-4">
        {project.demo && (
          <a 
            className="text-sm px-6 py-3 bg-gradient-to-r from-accent-1 to-accent-2 text-black rounded-lg font-medium hover:opacity-90 transition" 
            href={project.demo} 
            target="_blank" 
            rel="noreferrer"
          >
            Live Demo
          </a>
        )}
        {project.repo && (
          <a 
            className="text-sm px-6 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition" 
            href={project.repo} 
            target="_blank" 
            rel="noreferrer"
          >
            View Code
          </a>
        )}
      </div>
    </article>
  );
}

export default function ProjectsGrid() {
  return (
    <section id="projects" className="relative pt-32 pb-20 bg-black min-h-screen">
      <div className="container mx-auto px-4">
        {/* Sticky Header - locks at top when scrolling */}
        <div className="sticky top-20 z-20 bg-black py-6 mb-20">
          <h2 className="font-monoHead text-4xl text-center text-white">featured projects</h2>
        </div>
        
        {/* Stacking Cards - wrapper with defined height to control sticky behavior */}
        <div className="max-w-5xl mx-auto relative" style={{ height: `${projects.length * 600}px` }}>
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
