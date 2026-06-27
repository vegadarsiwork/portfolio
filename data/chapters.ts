// Narrative chapter data for the /v2 redesign.
// Descriptions grounded in the actual repos / deployments.

export type Chapter = {
  numeral: string;
  title: string;
  metaphor: string;
  story: string[];
  meta: string;
  year: string;
  demo?: string;
  repo?: string;
  /** Screenshot under /public, e.g. '/projects/truelend.png'. Falls back to a
   *  tinted title-card when unset or if the file 404s. */
  image?: string;
  /** Tint used in the thumbnail block */
  tint: string;
  /** A short caption shown under the visual */
  caption: string;
};

export const chapters: Chapter[] = [
  {
    numeral: 'I',
    title: 'PULSEQUEUE',
    metaphor: 'A distributed workflow engine in Go — the project where I stop building apps and start building infrastructure.',
    story: [
      'It started as an excuse to understand what actually happens underneath the async abstractions every web app leans on. I had wired up enough queues and cron jobs as black boxes; I wanted to build one from the metal up and find out what exactly-once, on-time, survives-a-crash really costs.',
      'A workflow engine in Go: a pool of concurrent workers pulling tasks off a persistent queue, with retries and backoff, delayed and scheduled execution, and at-least-once delivery that survives a worker dying mid-task. The near-term goal is correct single-node semantics under load; the longer arc is distributed coordination — leases, heartbeats, and a leader election so the same job never runs twice on two machines.',
      'It is early and exploratory, and I am building it in the open — design notes, the things that broke, and what I got wrong about concurrency the first time.',
    ],
    meta: 'SYSTEMS · GO · CONCURRENCY + QUEUES',
    year: '2026',
    tint: '#36c2a8',
    caption: 'Concurrent workers, persistent queue, retries — built to understand them.',
  },
  {
    numeral: 'II',
    title: 'TRUELEND CRM',
    metaphor: 'A job queue with no queue — a loan-lead CRM that runs async work off a Postgres table.',
    story: [
      'Affiliate-driven CRM for a Direct Selling Agent. Public capture forms and an EMI calculator feed leads into admin, department, and affiliate portals, each scoped by role — auth, RBAC, spam protection, transactional email, web push.',
      'The interesting part is the constraint: it had to run at near-zero cost, so I built the async layer myself instead of paying for a queue. Background jobs drain off a Postgres table — each claimed so it runs once and retried if it fails — triggered by cron and Durable Object alarms. Turborepo monorepo, Next.js 16 on Cloudflare Workers via OpenNext, Neon Postgres with Drizzle. It survives a worker dying mid-job, and it scales to a real broker without a rewrite.',
    ],
    meta: 'BACKEND · POSTGRES-AS-QUEUE · NEXT.JS + CLOUDFLARE',
    year: '2026',
    tint: '#ff8c42',
    caption: 'A job queue with no queue — built on a Postgres table.',
  },
  {
    numeral: 'III',
    title: 'LINCHPIN STUDIO',
    metaphor: 'The internal dashboard I built during my Linchpin internship.',
    story: [
      'A marketing-ops dashboard with three sides: a superadmin console, client dashboards (reels, clips, leads, scripts, billing), and a marketplace where influencers sign up and get campaign requests.',
      'Next.js 16, React 19, Postgres. UploadThing offloads media so the app servers stay stateless, OpenRouter does the AI script generation. Role-scoped auth, idempotent cron reminders. People log into it daily.',
    ],
    meta: 'FULL STACK · NEXT.JS + POSTGRES · INTERNSHIP',
    year: '2026',
    demo: 'https://linchpin-dashboard.vercel.app',
    repo: 'https://github.com/vegadarsiwork/linchpin-dashboard',
    tint: '#b06ab3',
    caption: 'Three roles, one dashboard.',
  },
  {
    numeral: 'IV',
    title: 'SPICE EXPRESS',
    metaphor: 'Logistics and dispatch software for a courier business.',
    story: [
      'Courier dispatch system used by a real ops team on their phones. Real-time package tracking, zone-based fare calculation, a delivery state machine, JWT auth with roles, and an admin analytics view.',
      'React 18 / TypeScript / Vite on the front; Node / Express / MongoDB on the back; split deploy across Netlify and Render. Built for daily operational use, not a demo.',
    ],
    meta: 'FULL STACK · DISPATCH · STATE MACHINE',
    year: '2025',
    demo: 'https://spiceexpress.vercel.app',
    repo: 'https://github.com/vegadarsiwork/spiceexpress',
    tint: '#e2522b',
    caption: 'Tracking, pricing, and dispatch in one place.',
  },
  {
    numeral: 'V',
    title: 'SENTINEL',
    metaphor: 'A multi-agent intelligence system that routes a question to the right specialists — and corrects itself when they fail.',
    story: [
      'Built for the NIAT Agentathon. You type a query; a routing agent classifies intent and a dynamic orchestrator dispatches it across nine specialist agents — company scouts, risk hunters, analysts, debuggers, memo writers — assembling the answer as they go.',
      'The engineering is in the failure handling. Llama 3.3 70B on Groq with a Gemini fallback, 429 backoff, and self-correcting retries that drop the temperature and re-ask when a model returns unparseable JSON. Every agent runs the same retry path, and the retries surface live — amber flashes on an animated agent graph.',
      'FastAPI streams the whole run over SSE into a mission-control UI (React + Vite) wired to the real event stream, not a mockup. With no API key it falls back to deterministic mock data so the demo never dies on stage.',
    ],
    meta: 'SYSTEMS · MULTI-AGENT ORCHESTRATION · FASTAPI + SSE',
    year: '2026',
    repo: 'https://github.com/vegadarsiwork/agentathon',
    tint: '#6c5cff',
    caption: 'Dynamic agent routing with self-correcting retries, streamed live.',
  },
  {
    numeral: 'VI',
    title: 'RENNOWISE',
    metaphor: 'Site supervision that can’t fake the GPS.',
    story: [
      'Construction oversight platform built around one hard guarantee: a contractor cannot fake a site visit. Every field check-in is validated server-side with MongoDB geospatial queries against the submitted coordinates — the trust boundary is the API, not the app.',
      'TypeScript across Node, deployed on Railway. Small surface, built around one property and enforcing it well.',
    ],
    meta: 'BACKEND · GEOSPATIAL · TRUST BOUNDARY',
    year: '2025',
    demo: 'https://rennowise.in',
    repo: 'https://github.com/vegadarsiwork/rennowise',
    tint: '#4361ee',
    caption: 'GPS-verified field audits.',
  },
];
