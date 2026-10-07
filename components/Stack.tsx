import Section from './Section';
import PixelReveal from './PixelReveal';

interface StackRow {
  label: string;
  tools: string[];
  note?: string;
}

const stack: StackRow[] = [
  {
    label: 'Languages',
    tools: ['TypeScript', 'JavaScript', 'Go', 'Python', 'SQL'],
  },
  {
    label: 'Systems',
    tools: ['Concurrency', 'Queues', 'Postgres internals', 'gRPC'],
    note: 'where my head is lately',
  },
  {
    label: 'Frameworks',
    tools: ['React', 'Next.js', 'Node / Express', 'Tailwind'],
  },
  {
    label: 'Databases',
    tools: ['PostgreSQL / Neon', 'MongoDB', 'Drizzle ORM', 'SQLite'],
  },
  {
    label: 'Infra & tooling',
    tools: ['Vercel', 'Cloudflare Workers', 'Railway', 'Turborepo'],
  },
  {
    label: 'Currently learning',
    tools: ['Distributed systems', 'Rust', 'Raft / consensus'],
  },
  {
    label: 'Design',
    tools: ['Figma', 'Framer Motion', 'Pixel Art'],
    note: 'badly, but improving',
  },
];

export default function Stack() {
  return (
    <Section
      id="stack"
      index="03"
      label="Stack"
      title="THE STACK."
      intro="Every tool I reach for without thinking, dumped from my dotfiles."
    >
      <PixelReveal>
        <dl>
          {stack.map((row) => (
            <div
              key={row.label}
              className="border-t border-[var(--color-v2-muted)]/20 py-4 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-x-6 gap-y-1"
            >
              <dt className="meta md:pt-[5px]">{row.label}</dt>
              <dd className="text-base text-[var(--color-v2-text)]/90">
                {row.tools.join(', ')}
                {row.note && <span className="text-[var(--color-v2-muted)]"> — {row.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </PixelReveal>
    </Section>
  );
}
