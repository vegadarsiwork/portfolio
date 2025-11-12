import { projects } from '@/data/projects';

export default function ProjectsGrid() {
  return (
    <section id="projects" className="py-12 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="font-monoHead text-2xl mb-4">featured projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <article key={p.id} className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5 hover:shadow-lg transition">
              <div className="mb-3 font-bold text-white">{p.title}</div>
              <div className="text-sm text-gray-300 mb-4">{p.description}</div>
              <div className="flex gap-2 flex-wrap mb-3">
                {p.tech.map(t => <span key={t} className="text-xs bg-white/5 px-2 py-1 rounded">{t}</span>)}
              </div>
              <div className="mt-auto flex gap-2">
                {p.demo && <a className="text-sm underline" href={p.demo} target="_blank" rel="noreferrer">live</a>}
                {p.repo && <a className="text-sm underline" href={p.repo} target="_blank" rel="noreferrer">code</a>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
