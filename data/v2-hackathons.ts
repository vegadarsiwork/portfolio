// Hackathon / ML archive — short résumé-style entries.
// Keep each one terse: what + where + result + takeaway.

export type HackathonEntry = {
  year: string;
  title: string;
  event: string;
  result: string;
  stack: string[];
  summary: string;
  repo?: string;
  demo?: string;
};

export const hackathons: HackathonEntry[] = [
  {
    year: '2024',
    title: 'CyberSafe',
    event: 'Build a Static Website / NIAT',
    result: '1st Place',
    stack: ['HTML', 'CSS', 'JS'],
    summary:
      'A static site that teaches non-technical adults the basics of staying safe online — privacy, passwords, phishing anatomy — without condescension.',
    repo: 'https://github.com/vegadarsiwork/CyberSafe',
    demo: 'https://cybersafe-niat.netlify.app/',
  },
  {
    year: '2024',
    title: 'Income Estimation',
    event: 'Matrix Protocol AIdea Hackathon',
    result: 'Finalist',
    stack: ['Python', 'scikit-learn', 'pandas'],
    summary:
      'Trained a model to estimate income and repayment ability for borrowers without conventional credit history. Came out of it more cautious about ML and more curious in equal measure.',
    repo: 'https://github.com/vegadarsiwork/income_estimation_AIdea_submission',
  },
  {
    year: '2025',
    title: 'OMR Evaluation',
    event: 'Code4EdTech Hackathon',
    result: 'Submission',
    stack: ['Python', 'OpenCV'],
    summary:
      'An automated OMR sheet evaluator built for a school-scale grading workflow — scan, threshold, classify, export. A real use case masquerading as a weekend project.',
    repo: 'https://github.com/vegadarsiwork/code4edtech-omreval',
  },
  {
    year: '2025',
    title: 'Anomaly Finder',
    event: 'BITS Spark Hackathon',
    result: 'Submission',
    stack: ['JavaScript', 'Stats'],
    summary:
      'A lightweight anomaly detection sandbox — point-anomaly, contextual, collective — visualised in-browser so you could watch the math argue with itself.',
    repo: 'https://github.com/vegadarsiwork/bits-anomaly-finder',
  },
  {
    year: '2026',
    title: 'UIDAI Submission',
    event: 'UIDAI Hackathon',
    result: 'Submission',
    stack: ['Python', 'Jupyter', 'ML'],
    summary:
      'An ML notebook tackling one of the UIDAI hackathon problem statements. Felt like writing an essay and running a science experiment at the same time.',
    repo: 'https://github.com/vegadarsiwork/uidai-hackathon',
  },
  {
    year: '2026',
    title: 'Alumni Connect',
    event: 'AI For Bharat / Team Build',
    result: 'Team Project',
    stack: ['TypeScript', 'LLM', 'Matching'],
    summary:
      'An AI-powered marketplace that intelligently connects student "Asks" with alumni "Offers" — part classifier, part match-maker, part directory.',
    repo: 'https://github.com/vegadarsiwork/alumni-connect',
  },
];
