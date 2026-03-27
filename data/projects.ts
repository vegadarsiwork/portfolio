export type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  thumb?: string;
  demo?: string;
  repo?: string;
};

export const projects: Project[] = [
  {
    id: 'spice-express',
    title: 'Spice Express Logistics',
    description: 'A full-stack logistics platform with dynamic rate mapping algorithms to automate freight calculations and digitize lorry receipts.',
    tech: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
    repo: 'https://github.com/vegadarsiwork/spiceexpress',
    demo: 'https://spiceexpress.vercel.app'
  },
  {
    id: 'rennowise',
    title: 'Rennowise',
    description: 'Construction oversight platform featuring a GPS-verified field audit system using MongoDB geospatial queries for secure contractor reporting.',
    tech: ['TypeScript', 'Node.js', 'MongoDB', 'Railway'],
    repo: 'https://github.com/vegadarsiwork/rennowise',
    demo: 'https://rennowise.in'
  },
  {
    id: 'klaro-ai',
    title: 'Klaro AI',
    description: 'Chrome Extension that injects an AI interface into YouTube to generate real-time video summaries and educational quizzes.',
    tech: ['JavaScript', 'LLM APIs', 'DOM Manipulation'],
    repo: 'https://github.com/vegadarsiwork/klaro'
  },
  {
    id: 'bibleway-web-frontend',
    title: 'BibleWay Web Frontend',
    description: 'Frontend web experience focused on clean content delivery, performance, and intuitive navigation.',
    tech: ['React', 'Express', 'Node.js', 'MongoDB'],
    repo: 'https://github.com/vegadarsiwork/bibleway-web-frontend'
  }
];
