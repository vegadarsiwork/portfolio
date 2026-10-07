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
- `app/page.tsx` (`/`) **is the portfolio** — the only one. It is a `'use client'` page (minimal dark layout with pixel-art accents, a day/night cycle and a `/`-command bar), composed of section components from `components/`: `Hero`, `About`, `SelectedWork`, `Stack`, `SideQuests`, `Hackathons`, `Outro`, plus `Moon`, `ScrollRail`, `CursorTrail`, `CommandBar` and `ScrollTopRocket`. When asked to change "the site", this is the page.
- `app/v2/page.tsx` (`/v2`) is a server-side `redirect('/')` kept only so old links resolve.
- The old v1 portfolio and three.js deps have been removed. The only WebGL is `PixelScene`: raw WebGL1 with one fragment shader, no library.

**Design rule: pixel art in a few places only.** The hero skyline, the project visuals (each shown on a pixel-art CRT screen, `CrtTv` — screen and bezel only, no controls), the desk scene behind the contact section, and the moon that travels between them. Everything between is flat near-black with Geist text, hairline dividers and no boxes. Pixel fonts are for headings only, set through the `.pxh-*` classes in `globals.css`: Doto (dot-matrix) for section headings, project titles and the outro, Geist Pixel (Vercel's pixel Geist, proportional — so narrow letters like "i" don't leave gaps) for the hero wordmark, the command bar and the preloader; DotGothic16 stays only as its fallback. Don't size either with arbitrary `text-[..]` utilities. Small print uses `.meta`, text links use `.link`, and the accent colour is used sparingly. Scanlines, glow and the cursor sprite only appear when the visitor runs `/crt on`.

**Pixel scenes.** `components/PixelScene.tsx` fills its positioned parent with a low-res canvas (one art pixel = `PX` = 4 CSS px, see `lib/pixel.ts`) drawn by the shader in `lib/scene-shader.ts`. `view="skyline"` is the hero (dithered sky, sun with halo, drifting clouds, a plane, shooting stars, four building layers; palette follows `hour` via `lib/time-presets.ts`). The page opens at a fixed `DEFAULT_HOUR` (night, in `app/page.tsx`) rather than the visitor's clock; the time control and `/time` commands still change it, and AUTO or `/time realtime` follows the real clock. The hero's top bar is a status bar (name, location, and the live local time in `TIME_ZONE`, all constants in `Hero.tsx`) — that clock is the real one and is separate from the scene's time of day, which the button beside it changes. The hero copy is left-aligned on the page column, and the sun's arc runs right to left; `view="desk"` is the closing scene in `Outro`: a desk on a rooftop under a night sky that stays night whatever the clock says. From 1200px up it sits beside the contact copy, against the right edge; below that it goes underneath (the shader's `narrow` switch, `Outro`'s `min-[1200px]:` padding and `Moon`'s `deskAnchor` must agree on that breakpoint). Its sky has no frame — it eases out of the page colour and reaches up into the gap above the section — and its starfield fills in as the section scrolls into view. Scenes sit in the page flow, scroll away with their section, dither into the page at their edge, and only render while on screen. Each reacts to its own scroll progress: the skyline scrolls slower than the page (`PARALLAX`), its nearer layers lift faster than the far ones, and it dissolves into the page through a growing dither band; the desk's monitor boots and fills with code as it arrives. Without WebGL the skyline falls back to a flat gradient.

**Scroll motion is smooth, not stepped** (the user found stepped pixel motion laggy). `PixelReveal` fades and rises a block into place when it enters view — the same motion as the hero copy; `StaggerWords` fades headings up word by word; `Hero` fades its wordmark out against the Lenis scroll value; each `CrtTv` switches on (a bright line opening into the picture) the first time it scrolls into view; `PixelDiagram` animates only while at least half of it is on screen.

**The moon.** `Moon` is the one element that travels the whole page, and neither scene draws a moon of its own. It starts in the hero sky (on the same arc the skyline used), drifts down the right-hand margin as you scroll — its height is your progress — and settles into the desk scene's sky, which it finds by `[data-scene="desk"]`. Below about 1250px wide there is no margin to ride in, so it hides between the two scenes. It casts a soft moonlight glow on the page under the content, and it can be dragged: it speaks a line in a speech bubble, then floats back on release. `FallingStars` sends a few stars down the side margins with it, each at its own pace, kept clear of the moon's lane and the rail.

**The rail.** `ScrollRail` is section navigation: a hairline in the left margin with the section numbers on it, each lighting up as you reach it. It is hidden while the hero or the contact section is on screen. The numbers are the page's navigation — it finds sections by `id`, so a new section needs an entry in its `SECTIONS` list. Below `lg` it is a plain progress line on the left edge. `ScrollTopRocket` is a Minecraft-style firework rocket: it flies in from the right edge (random height, curved path) to dock in the back-to-top button whenever the button appears, and on click launches up the screen in a random direction — sometimes on a squiggly path — and bursts into a firework, drawn on its own canvas. Easter egg: the Konami code or `/fireworks` sets off a show of a few dozen rockets from the bottom edge (`FIREWORKS_EVENT`). `CursorTrail` leaves a short tail of lit grid cells behind the mouse (mouse only; replaced by the old `CursorSprite` under `/crt on`).

**Layout (flat, no `v2` prefix):**
- `components/` — all UI components (one flat folder).
- `lib/` — non-component logic: `utils.ts` (`cn`), `pixel.ts` (grid unit, colour helper, Bayer matrix), `scene-shader.ts` (GLSL for `PixelScene`), `lenis-store.ts` (scroll pub/sub), `motion-settings.ts` (`useV2MotionSettings` — reduced-motion / device tuning), `time-presets.ts` (`getInterpolatedPreset` — hour → sky/colour preset).
- `data/` — content: `chapters.ts` (projects), `hackathons.ts`, `quests.ts`.

**Smooth scrolling is global.** `app/layout.tsx` is a server component that exports `metadata` and renders `app/providers.tsx` (`'use client'`), which instantiates [Lenis](https://github.com/darkroomengineering/lenis), drives it from `requestAnimationFrame`, and runs the initial preloader. `providers.tsx` also broadcasts the Lenis scroll value via `lib/lenis-store.ts` so scroll-reactive pieces (the Hero exit, the moon, the scenes) stay in lockstep with the content — read from there, not `window.scrollY`. Anything that competes with scroll (custom scroll listeners, `scroll-snap`, locking `overflow`) needs to coordinate with Lenis.

**Styling — Tailwind v4 with `@theme`.** `app/globals.css` defines design tokens via the v4 `@theme { ... }` block. The theme uses `--color-v2-*`, `--font-family-display-v2` (Doto, headings), `--font-family-pixel-v2` (Geist Pixel, hero wordmark) and `--font-family-body-v2` (Geist). All load via `<link>` in `app/layout.tsx`; the Aeonik files in `public/fonts/` are no longer referenced. There is no `tailwind.config.*`. Use `cn()` from `lib/utils.ts` when composing class names.

**Path alias.** `@/*` resolves to the repo root, so imports use `@/components/...`, `@/lib/...`, `@/data/...`.

**Content data** lives in `data/chapters.ts` (projects), `data/hackathons.ts`, and `data/quests.ts`. Edit those rather than hardcoding into components. `chapters.ts` is in display order: entries with `featured: true` get a full chapter (`ProjectChapter`), the rest are listed as one-line rows under "Also shipped" (`ProjectRow`). The about text, the one role and the "currently" log live in `components/About.tsx`. `ProjectChapter` picks a chapter's visual in this order: `image` (a screenshot under `/public`, e.g. `/projects/truelend.png`, shown through a dither filter that clears on hover), then `diagram` (one of the animated pixel diagrams in `components/PixelDiagram.tsx`), then a plain title-card — so add screenshots by setting `image` on a chapter and dropping the file in `public/`.
