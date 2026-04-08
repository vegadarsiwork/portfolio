// Narrative chapter data for the /v2 redesign.
// Each entry is an editorial story for a project — metaphor, role, body copy.
// TODO: replace placeholder body copy with real reflections before shipping.

export type Chapter = {
  numeral: string;
  title: string;
  metaphor: string;
  story: string[];
  meta: string;
  year: string;
  demo?: string;
  repo?: string;
  /** Tint used in the thumbnail block */
  tint: string;
  /** A short caption shown under the visual */
  caption: string;
};

export const chapters: Chapter[] = [
  {
    numeral: 'I',
    title: 'CYBERSAFE',
    metaphor: 'Think Khan Academy, but for not getting phished.',
    story: [
      "CyberSafe started as a question I couldn't shake: why does every adult I know fall for the same scam emails? I built a static site that taught the basics of staying safe online — privacy hygiene, password rules, the anatomy of a phishing link — in a tone that didn't talk down to anyone.",
      "It went on to win 1st place at the Build a Static Website hackathon. The trophy was nice. The thing that actually mattered was watching my dad use the password section.",
    ],
    meta: 'SOLO · WEB · 1ST PLACE / HACKATHON',
    year: '2024',
    demo: 'https://cybersafe-niat.netlify.app/',
    repo: 'https://github.com/vegadarsiwork/CyberSafe',
    tint: '#4361ee',
    caption: 'A learning site that doesn’t condescend.',
  },
  {
    numeral: 'II',
    title: 'INCOME ESTIMATION',
    metaphor: 'Think credit score, but built for people the credit bureau forgot.',
    story: [
      "For the Matrix Protocol AI Hackathon I trained a model to estimate income and repayment ability for borrowers without conventional credit history. It was the first time I really sat with the weight of building ML for high-stakes decisions — every false negative is a real person being told no.",
      "The submission made it to the finalist round. I came out of it more cautious about ML and more curious about it at the same time, which is probably the right ratio.",
    ],
    meta: 'SOLO · ML · FINALIST / AI HACKATHON',
    year: '2024',
    repo: 'https://github.com/vegadarsiwork/income_estimation_AIdea_submission',
    tint: '#7209b7',
    caption: 'Trained on the people the credit bureau forgot.',
  },
  {
    numeral: 'III',
    title: 'TASTY KITCHENS',
    metaphor: 'Think Swiggy, but as a learning project I refused to half-ship.',
    story: [
      "A full-stack MERN clone of a food delivery app with REST APIs, persistent cart, and authenticated routes. On paper it's a clone. In practice it's where I learned what production-shaped code actually feels like — error states, loading states, the boring middle where most tutorials stop and the real work begins.",
      "I shipped every screen, including the ones nobody screenshots for the case study. That's the part I'm proud of.",
    ],
    meta: 'SOLO · MERN · LEARNING PROJECT',
    year: '2023',
    demo: 'https://tasty-kitchens-react.netlify.app/',
    repo: 'https://github.com/vegadarsiwork/tasty-kitchens',
    tint: '#ff8c42',
    caption: 'The boring middle, fully shipped.',
  },
  {
    numeral: 'IV',
    title: 'SLOTHCLICKS',
    metaphor: 'Think Human Benchmark, but the UI actually wants you to win.',
    story: [
      "A reaction-time tester with a neon arcade aesthetic and obsessive feedback loops — every click feels something. I built it because I wanted to see how much personality you could pour into a tool that does exactly one thing.",
      "It's the smallest project on this page. It might also be the most honest.",
    ],
    meta: 'SOLO · WEB · TINY TOOL',
    year: '2023',
    demo: 'https://slothclicks.niat.tech/',
    repo: 'https://github.com/vegadarsiwork/slothclicks',
    tint: '#b06ab3',
    caption: 'A tool that wants you to win.',
  },
];
