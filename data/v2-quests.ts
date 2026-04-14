// Side Quests — real, shipped experiments / smaller repos.
// Two special kinds ('lab-pixels' and 'lab-reaction') render interactive toys
// inline instead of a static placeholder.

export type Quest = {
  title: string;
  tag: string;
  tint: string;
  href?: string;
  /** Optional one-line blurb shown on hover. */
  blurb?: string;
  /** If set, render an interactive cell instead of a static tile. */
  kind?: 'lab-pixels' | 'lab-reaction';
};

export const quests: Quest[] = [
  {
    title: 'HOVER GRID',
    tag: 'CANVAS · LAB',
    tint: '#ff8c42',
    kind: 'lab-pixels',
    blurb: 'move your cursor over me.',
  },
  {
    title: 'MONOFLOW',
    tag: 'UI · MONO',
    tint: '#5b8def',
    href: 'https://github.com/vegadarsiwork/monoflow',
    blurb: 'a monochrome flow-state editor.',
  },
  {
    title: 'AI FOR BHARAT',
    tag: 'AI · BUILD',
    tint: '#7209b7',
    href: 'https://github.com/vegadarsiwork/aiforbharat',
    blurb: 'building AI that speaks the local dialect.',
  },
  {
    title: 'REACTION',
    tag: 'MINI-GAME · LAB',
    tint: '#b06ab3',
    kind: 'lab-reaction',
    blurb: 'click when the square lights up.',
  },
  {
    title: 'TASTY KITCHENS',
    tag: 'MERN · LEARN',
    tint: '#ffb061',
    href: 'https://github.com/vegadarsiwork/tasty-kitchens',
    blurb: 'a swiggy clone i refused to half-ship.',
  },
  {
    title: 'COURIER TRACKER',
    tag: 'JS · TOOL',
    tint: '#4361ee',
    href: 'https://github.com/vegadarsiwork/couriertracker',
    blurb: 'a tiny logistics sandbox.',
  },
];
