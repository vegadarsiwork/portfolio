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

**Two entry points, and they are not equivalent:**
- `app/page.tsx` (`/`) is still the default `create-next-app` template and is *not* the real portfolio.
- `app/demo/page.tsx` (`/demo`) is the actual portfolio composition. When asked to change "the site", this is almost always the page to edit.

`/demo` composes section components from `components/ui/` in this order: `FloatingNav`, `CommandMenu`, `Spotify`, `Hero` (dynamically imported with `ssr: false`), then `About`, `ProjectsGrid`, `Skills`, `Contact`, `Footer` inside a `z-10` wrapper that sits above the fixed hero background.

**Hero is client-only on purpose.** `hero-ascii-one` and `PixelBlast` use `three` / `postprocessing` (WebGL) and must not run during SSR — keep the `dynamic(..., { ssr: false })` import in `app/demo/page.tsx` when touching it.

**Smooth scrolling is global.** `app/layout.tsx` is a `'use client'` component that instantiates [Lenis](https://github.com/darkroomengineering/lenis) in a `useEffect` and drives it from `requestAnimationFrame`. Anything that competes with scroll (custom scroll listeners, `scroll-snap`, locking `overflow`) needs to coordinate with Lenis. `html { scroll-behavior: smooth }` is also set in `globals.css`.

**Styling — Tailwind v4 with `@theme`.** `app/globals.css` defines the design tokens via the v4 `@theme { ... }` block (`--color-bg`, `--color-accent-1`, `--color-accent-2`, `--font-family-mono-head` for Silkscreen, `--font-family-body` for Aeonik). Aeonik is loaded from `public/fonts/` via `@font-face`; Silkscreen is loaded from Google Fonts in `app/layout.tsx`. There is no `tailwind.config.*` — all theme customization happens in CSS. Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) when conditionally composing class names.

**Path alias.** `@/*` resolves to the repo root (see `tsconfig.json`), so imports use `@/components/ui/...`, `@/lib/utils`, `@/data/projects`.

**`components/ui/index.ts` is incomplete** — it only re-exports `SiteHeader` and `Footer`. Every other section is imported by direct path from `app/demo/page.tsx`. Don't assume the barrel file is the source of truth.

**Project data** lives in `data/projects.ts` as a typed `Project[]` and is consumed by `ProjectsGrid`. Add new portfolio entries there rather than hardcoding into the component.
