import Section from './Section';
import PixelReveal from './PixelReveal';

const facts = [
  { label: 'Currently', value: 'Full stack dev, Linchpin' },
  { label: 'Studying', value: 'B.Tech CSE, NIAT (8.1 CGPA)' },
  { label: 'Based in', value: 'India' },
];

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
    type: 'Intern',
    dates: 'Apr — Jun 2026',
    duration: '3 mos',
    bullets: [
      'Built and shipped an internal marketing-ops dashboard now used daily — a superadmin console, role-scoped client dashboards, and an influencer marketplace.',
      'Owned the backend surface: Postgres data model, role-scoped auth, and idempotent cron reminders, with media offloaded so the app servers stay stateless.',
      'Shipped to production on Next.js 16 / React 19 — wiring in an AI script pipeline (OpenRouter) and a media pipeline (UploadThing) without breaking the people logging in every day.',
    ],
  },
];

const feed = [
  { date: '2026.06.18', tag: 'Building',  text: 'pulsequeue - a distributed workflow engine in go. learning the hard parts.' },
  { date: '2026.04.12', tag: 'Interning', text: 'full stack web dev at Linchpin Soft Solutions.' },
  { date: '2026.04.02', tag: 'Studying',  text: 'B.Tech CSE at NIAT - semester four, AI track.' },
  { date: '2026.03.28', tag: 'Shipped',   text: 'spice express dispatch tools in production.' },
  { date: '2026.03.20', tag: 'Thinking',  text: 'about what it takes to run a job exactly once, across workers that crash.' },
];

const divider = 'border-t border-[var(--color-v2-muted)]/20';

/**
 * Who I am, the one job so far, and what is on the desk now — one section
 * instead of three.
 */
export default function About() {
  return (
    <Section id="about" index="01" label="About" title="I started by accident.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Story */}
        <div className="lg:col-span-7 space-y-5 text-base md:text-lg leading-relaxed text-[var(--color-v2-text)]/85">
          <PixelReveal>
            <p>
              I&apos;m a second-year CSE student at NIAT, currently a Full Stack Web Developer intern at
              Linchpin Soft Solutions. I&apos;ve shipped a stack of full-stack apps - but lately
              I&apos;ve been pulled toward the{' '}
              <span className="text-[var(--color-v2-orange)]">backend</span>: queues, concurrency, and
              the stuff that has to stay correct when things fail. Somewhere between someone who codes
              and someone who ships things.
            </p>
          </PixelReveal>
          <PixelReveal delay={0.1}>
            <p>
              Before all this I led my school&apos;s robotics team to the FLL National Championships,
              founded a chess club, and studied CS and Physics through the IB Diploma at Aga Khan
              Academy. In 2024 I went deep on hackathons and freelance work - shipped five+ full-stack
              apps and reached the finals of a couple of AI hackathons that taught me what I still
              don&apos;t know.
            </p>
          </PixelReveal>
        </div>

        {/* Facts */}
        <PixelReveal delay={0.15} className="lg:col-span-5">
          <dl>
            {facts.map((f) => (
              <div key={f.label} className={`${divider} grid grid-cols-[96px_1fr] gap-4 py-3`}>
                <dt className="meta pt-[3px]">{f.label}</dt>
                <dd className="text-sm md:text-base text-[var(--color-v2-text)]/90">{f.value}</dd>
              </div>
            ))}
          </dl>
        </PixelReveal>
      </div>

      {/* The day job */}
      <div className="mt-16 md:mt-24">
        <PixelReveal>
          <p className="meta mb-4">Experience</p>
        </PixelReveal>
        {roles.map((role) => (
          <PixelReveal key={role.org + role.title}>
            <div className={`${divider} py-6 grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-4`}>
              <div className="lg:col-span-5">
                <h3 className="text-lg md:text-xl font-medium text-[var(--color-v2-text)]">{role.title}</h3>
                <p className="mt-1 text-sm md:text-base text-[var(--color-v2-text)]/70">{role.org}</p>
                <p className="meta mt-3 tabular-nums">
                  {role.type} / {role.dates} / {role.duration}
                </p>
              </div>
              <ul className="lg:col-span-7 space-y-3 text-sm md:text-[15px] leading-relaxed text-[var(--color-v2-text)]/75">
                {role.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </PixelReveal>
        ))}
      </div>

      {/* Currently */}
      <div className="mt-12 md:mt-16">
        <PixelReveal>
          <p className="meta mb-4">Currently</p>
        </PixelReveal>
        <PixelReveal>
          <ul>
            {feed.map((entry) => (
              <li
                key={entry.date + entry.tag}
                className={`${divider} py-3 grid grid-cols-[88px_1fr] sm:grid-cols-[88px_96px_1fr] gap-x-4 gap-y-1 items-baseline`}
              >
                <span className="meta tabular-nums">{entry.date}</span>
                <span className="meta">{entry.tag}</span>
                <span className="col-span-2 sm:col-span-1 text-sm md:text-[15px] text-[var(--color-v2-text)]/85">
                  {entry.text}
                </span>
              </li>
            ))}
          </ul>
        </PixelReveal>
      </div>
    </Section>
  );
}
