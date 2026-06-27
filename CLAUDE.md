# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server (http://localhost:3000)
- `npm run build` — production build
- `npm start` — run the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `next/core-web-vitals`)

There is no test runner configured in this repo.

## Architecture

This is a Next.js 16 (App Router) + React 19 + Tailwind CSS v4 personal portfolio.

**Routes:**
- `app/page.tsx` (`/`) **is the portfolio** — the only one. It is a `'use client'` page (pixel / twilight-CRT theme with a day/night cycle and a `/`-command bar), composed of section components from `components/`: `Hero`, `Origin`, `SelectedWork`, `Stack`, `SideQuests`, `Hackathons`, `Now`, `Outro`, plus fixed-atmosphere layers (`Starfield`, `Scanlines`, `CursorSprite`, `CommandBar`). When asked to change "the site", this is the page.
- `app/v2/page.tsx` (`/v2`) is a server-side `redirect('/')` kept only so old links resolve.
- The old v1 portfolio and three.js deps have been removed. There is no WebGL anywhere — the scene (`PixelScene`) is plain 2D canvas.

**Layout (flat, no `v2` prefix):**
- `components/` — all UI components (one flat folder).
- `lib/` — non-component logic: `utils.ts` (`cn`), `lenis-store.ts` (scroll pub/sub), `motion-settings.ts` (`useV2MotionSettings` — reduced-motion / device tuning), `time-presets.ts` (`getInterpolatedPreset` — hour → sky/colour preset).
- `data/` — content: `chapters.ts` (projects), `hackathons.ts`, `quests.ts`.

**Smooth scrolling is global.** `app/layout.tsx` is a server component that exports `metadata` and renders `app/providers.tsx` (`'use client'`), which instantiates [Lenis](https://github.com/darkroomengineering/lenis), drives it from `requestAnimationFrame`, and runs the initial preloader. `providers.tsx` also broadcasts the Lenis scroll value via `lib/lenis-store.ts` so scroll-reactive layers (Hero parallax) stay in lockstep with the content — read from there, not `window.scrollY`. Anything that competes with scroll (custom scroll listeners, `scroll-snap`, locking `overflow`) needs to coordinate with Lenis.

**Styling — Tailwind v4 with `@theme`.** `app/globals.css` defines design tokens via the v4 `@theme { ... }` block. The v2 theme uses `--color-v2-*` and `--font-family-*-v2` (DotGothic16/Silkscreen/Doto pixel fonts, Geist for body/headings, VT323 terminal). Fonts load via `<link>` in `app/layout.tsx`; Aeonik is still in `public/fonts/`. There is no `tailwind.config.*`. Use `cn()` from `lib/utils.ts` when composing class names.

**Path alias.** `@/*` resolves to the repo root, so imports use `@/components/...`, `@/lib/...`, `@/data/...`.

**Content data** lives in `data/chapters.ts` (projects), `data/hackathons.ts`, and `data/quests.ts`. Edit those rather than hardcoding into components. `ProjectChapter` renders a chapter's `image` (a screenshot under `/public`, e.g. `/projects/truelend.png`) when set, and falls back to a tinted pixel title-card otherwise — so add screenshots by setting `image` on a chapter and dropping the file in `public/`.
