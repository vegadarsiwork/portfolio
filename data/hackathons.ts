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
      'My first hackathon win — a security-awareness tool that teaches non-technical users to recognize phishing, weak passwords, and privacy leaks. Static-only constraint, shipped fast. Where the curiosity started.',
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
      'A model that estimates income and repayment ability for borrowers with no formal credit history.',
    repo: 'https://github.com/vegadarsiwork/income_estimation_AIdea_submission',
  },
  {
    year: '2025',
    title: 'OMR Evaluation',
    event: 'Code4EdTech Hackathon',
    result: 'Submission',
    stack: ['Python', 'OpenCV'],
    summary:
      'An automated OMR sheet grader for a school grading workflow. Scan a sheet, get scores out.',
    repo: 'https://github.com/vegadarsiwork/code4edtech-omreval',
  },
  {
    year: '2025',
    title: 'Anomaly Finder',
    event: 'BITS Spark Hackathon',
    result: 'Submission',
    stack: ['JavaScript', 'Stats'],
    summary:
      'A small in-browser sandbox for anomaly detection. You tweak the inputs, it flags the outliers live.',
    repo: 'https://github.com/vegadarsiwork/bits-anomaly-finder',
  },
  {
    year: '2026',
    title: 'Alumni Connect',
    event: 'AI For Bharat / Team Build',
    result: 'Team Project',
    stack: ['TypeScript', 'LLM', 'Matching'],
    summary:
      'An AI marketplace that matches student "asks" to alumni "offers". A team build for AI For Bharat.',
    repo: 'https://github.com/vegadarsiwork/alumni-connect',
  },
];
