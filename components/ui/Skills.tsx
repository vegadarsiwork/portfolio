import { 
  SiReact, 
  SiTypescript, 
  SiHtml5, 
  SiTailwindcss, 
  SiJavascript, 
  SiNodedotjs, 
  SiMongodb, 
  SiFramer, 
  SiPython, 
  SiGit,
  SiExpress
} from 'react-icons/si';
import { FaCode } from 'react-icons/fa';

const skills = [
  // Row 1: React (large) + smaller cards on right
  { name: 'React & Next.js', level: 'Expert', desc: 'Building modern web applications', size: 'col-span-2 row-span-2', icon: SiReact },
  { name: 'TypeScript', level: 'Advanced', desc: 'Type-safe development', size: 'col-span-1 row-span-1', icon: SiTypescript },
  { name: 'Node.js', level: 'Advanced', desc: '', size: 'col-span-1 row-span-1', icon: SiNodedotjs },
  { name: 'REST APIs', level: 'Advanced', desc: '', size: 'col-span-1 row-span-1', icon: FaCode },
  { name: 'HTML & CSS', level: 'Expert', desc: 'Semantic markup & styling', size: 'col-span-2 row-span-1', icon: SiHtml5 },
  { name: 'MongoDB', level: 'Intermediate', desc: '', size: 'col-span-1 row-span-1', icon: SiMongodb },
  
  // Row 2: JavaScript (large) + Python (medium) + Tailwind
  { name: 'JavaScript', level: 'Expert', desc: 'ES6+ & modern JS', size: 'col-span-2 row-span-2', icon: SiJavascript },
  { name: 'Python', level: 'Intermediate', desc: 'Data & scripting', size: 'col-span-2 row-span-1', icon: SiPython },
  { name: 'Tailwind CSS', level: 'Expert', desc: '', size: 'col-span-1 row-span-1', icon: SiTailwindcss },
  
  // Row 3: Small cards
  { name: 'Express.js', level: 'Advanced', desc: '', size: 'col-span-1 row-span-1', icon: SiExpress },
  { name: 'Framer Motion', level: 'Advanced', desc: '', size: 'col-span-1 row-span-1', icon: SiFramer },
  { name: 'Git', level: 'Advanced', desc: '', size: 'col-span-1 row-span-1', icon: SiGit },
];

export default function Skills() {
  return (
    <section id="skills" className="py-32 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="font-monoHead text-4xl mb-12 text-center text-white">skills & expertise</h2>
        
        {/* True Bento Grid - Irregular, Asymmetric Layout */}
        <div className="max-w-6xl mx-auto grid grid-cols-5 gap-4 auto-rows-[150px]">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className={`
                group relative bg-gradient-to-br from-white/5 to-white/[0.02] 
                rounded-2xl p-5 border border-white/10 
                hover:border-accent-1/50 hover:bg-white/10
                transition-all duration-300 cursor-pointer
                flex flex-col
                ${skill.size}
              `}
            >
              {/* Icon */}
              <div className="text-2xl text-white mb-auto">
                <skill.icon />
              </div>
              
              {/* Content at bottom */}
              <div className="mt-auto">
                {/* Skill Name */}
                <h3 className="font-bold text-white mb-1 text-base leading-tight">
                  {skill.name}
                </h3>
                
                {/* Description (only if exists) */}
                {skill.desc && (
                  <p className="text-xs text-gray-400 mb-2 leading-snug">{skill.desc}</p>
                )}
                
                {/* Level Badge */}
                <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-accent-1/10 text-accent-1 border border-accent-1/20">
                  {skill.level}
                </span>
              </div>
              
              {/* Hover gradient effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-1/0 to-accent-2/0 group-hover:from-accent-1/5 group-hover:to-accent-2/5 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
