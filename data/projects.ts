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
    id: 'cybersafe',
    title: 'CyberSafe',
    description: 'Privacy & cybersecurity learning platform — 1st place in Build a Static Website Hackathon.',
    tech: ['HTML','CSS','JS'],
    demo: 'https://cybersafe-niat.netlify.app/',
    repo: 'https://github.com/vegadarsiwork/CyberSafe'
  },
  {
    id: 'income-estimation',
    title: 'Income Estimation & Repayment Model',
    description: 'ML model for income & repayment ability — Matrix Protocol AI Hackathon finalist.',
    tech: ['Python','Colab'],
    repo: 'https://github.com/vegadarsiwork/income_estimation_AIdea_submission'
  },
  {
    id: 'slothclicks',
    title: 'SlothClicks',
    description: 'Neon reaction time tester with UX-focused feedback.',
    tech: ['HTML','CSS','JS'],
    demo: 'https://slothclicks.niat.tech/',
    repo: 'https://github.com/vegadarsiwork/slothclicks'
  },
  {
    id: 'tasty-kitchens',
    title: 'Tasty Kitchens',
    description: 'MERN full-stack Swiggy/Zomato clone with REST APIs and persistent cart.',
    tech: ['MongoDB','Express','React','Node'],
    repo: 'https://github.com/vegadarsiwork/tasty-kitchens',
    demo: 'https://tasty-kitchens-react.netlify.app/'
  }
];
