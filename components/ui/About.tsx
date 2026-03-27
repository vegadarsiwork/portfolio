const timeline = [
    {
        year: 'Now',
        title: 'Full Stack Game Dev Intern',
        desc: 'Developing immersive digital experiences at Linchpin Soft Solutions.',
        current: true
    },
    {
        year: '2024-2028',
        title: 'B.Tech CSE at NIAT',
        desc: 'Currently pursuing B.Tech CSE with an 8.1 CGPA while specializing in AI and web development.',
        current: false
    },
    {
        year: '2024',
        title: 'Freelance & Hackathons',
        desc: 'Deployed 5+ full-stack apps and reached finals in major AI hackathons.',
        current: false
    },
    {
        year: '2020-24',
        title: 'IB Diploma',
        desc: 'Studied CS and Physics at Aga Khan Academy and led the school robotics team.',
        current: false
    }
];

export default function About() {
    return (
        <section
            id="about"
            className="relative z-10 pt-48 pb-32 overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, transparent, black 300px, black 100%)' }}
        >
            {/* Background Gradient (Side) */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-20">

                {/* Left: Bio */}
                <div>
                    <h2 className="font-monoHead text-4xl text-white mb-8">about me</h2>
                    <div className="prose prose-invert text-gray-300 leading-relaxed">
                        <p className="text-lg mb-6">
                            I am a second-year CSE student at NIAT with an 8.1 CGPA, currently pushing the boundaries of interactive experiences as a Full Stack Game Dev Intern at Linchpin Soft Solutions.
                            I specialize in building AI-powered web applications and high-performance digital tools.
                        </p>
                        <p className="mb-6">
                            My journey ranges from leading robotics teams to the FLL National Championships to founding chess clubs and winning hackathons.
                            I thrive on rapid prototyping and turning complex problems into clean, functional code.
                        </p>
                    </div>

                    {/* "What I'm doing now" Badge */}
                    <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40 [animation-duration:2s]"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm text-gray-300">Open to new opportunities</span>
                    </div>
                </div>

                {/* Right: Timeline */}
                <div className="relative border-l border-white/10 pl-8 ml-4 lg:ml-0 space-y-12">
                    {timeline.map((item, idx) => (
                        <div key={idx} className="relative group">
                            {/* Dot */}
                            <div className={`
                absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-black 
                ${item.current ? 'bg-accent-1 shadow-[0_0_10px_rgba(0,255,213,0.5)]' : 'bg-white/20'}
                transition-colors duration-300
              `} />

                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                                <span className={`font-monoHead text-xl ${item.current ? 'text-accent-1' : 'text-white'}`}>
                                    {item.year}
                                </span>
                                <h3 className="font-bold text-white text-lg">{item.title}</h3>
                            </div>
                            <p className="text-gray-400 text-sm max-w-md">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
