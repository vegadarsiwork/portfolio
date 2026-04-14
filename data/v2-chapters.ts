// Narrative chapter data for the /v2 redesign.
// Descriptions grounded in the actual repos / deployments, not the placeholder
// blurbs that used to live here.

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
    title: 'SPICE EXPRESS',
    metaphor: 'A full logistics stack for a courier industry still living on carbon paper.',
    story: [
      'Spice Express is a modern logistics and courier management system — real-time package tracking, zone-based fare calculation, delivery workflow management, JWT-authenticated roles, and an admin analytics layer that can actually answer questions at the end of a shift.',
      'React 18 + TypeScript + Vite on the frontend, Node + Express + MongoDB on the backend, Netlify and Render for deploys. The goal wasn\u2019t a pretty demo — it was software an ops team could open on a phone at 10pm and trust.',
    ],
    meta: 'FULL STACK · MERN + TS · CLIENT PROJECT',
    year: '2025',
    demo: 'https://spiceexpress.vercel.app',
    repo: 'https://github.com/vegadarsiwork/spiceexpress',
    tint: '#ff8c42',
    caption: 'Tracking, pricing, and dispatch — in one place.',
  },
  {
    numeral: 'II',
    title: 'RENNOWISE',
    metaphor: 'Think site supervisor, but they can\u2019t fake the GPS.',
    story: [
      'A construction oversight platform built around a GPS-verified field audit system — MongoDB geospatial queries back every contractor check-in with a coordinate the server will actually argue with.',
      'TypeScript end-to-end on Node, deployed on Railway. My first real taste of building for accountability: short feature list, and every item has teeth.',
    ],
    meta: 'FULL STACK · TS · GEOSPATIAL',
    year: '2025',
    demo: 'https://rennowise.in',
    repo: 'https://github.com/vegadarsiwork/rennowise',
    tint: '#4361ee',
    caption: 'Trust, but verify with a coordinate.',
  },
  {
    numeral: 'III',
    title: 'KLARO',
    metaphor: 'A Chrome extension that turns YouTube videos into a study session.',
    story: [
      'Klaro injects an AI-powered study panel straight into YouTube — generating MCQs, open-ended questions, and coding challenges from whatever video is on screen. Built as a Manifest V3 extension with React, TypeScript, Tailwind, and Vite.',
      'The fun part was making the UI feel like it belonged on YouTube. The hard part was everything else — content-script messaging, LLM latency, and YouTube\u2019s habit of rewriting its DOM every other week.',
    ],
    meta: 'SOLO · CHROME EXTENSION · LLM',
    year: '2025',
    repo: 'https://github.com/vegadarsiwork/klaro',
    tint: '#7209b7',
    caption: 'An AI tutor that lives inside the player.',
  },
  {
    numeral: 'IV',
    title: 'BIBLEWAY',
    metaphor: 'The Modern Sanctuary — built for people who want their scripture to load fast.',
    story: [
      'A content-first frontend for BibleWay, billed as \u201CThe Modern Sanctuary.\u201D Next.js + TypeScript, Vitest for the parts that matter, and a Python/Express backend feeding dynamic content in.',
      'Not flashy. Just careful — the kind of site that taught me how much of good frontend work is restraint.',
    ],
    meta: 'FRONTEND · NEXT.JS + TS',
    year: '2024',
    demo: 'https://bibleway-web-frontend.vercel.app',
    repo: 'https://github.com/vegadarsiwork/bibleway-web-frontend',
    tint: '#b06ab3',
    caption: 'Restraint, shipped as a website.',
  },
];
