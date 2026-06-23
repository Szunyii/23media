# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint (flat config in `eslint.config.mjs`); lint one file with `npx eslint app/page.tsx`

There is no test framework configured.

## Architecture

Next.js **16.2.9** App Router project with React 19, TypeScript (strict), and Tailwind CSS v4.

- All routes live in `app/`. Currently just the root layout (`app/layout.tsx`, loads Geist fonts and global CSS) and home page (`app/page.tsx`).
- Tailwind v4 is configured through PostCSS (`@tailwindcss/postcss`) — there is **no** `tailwind.config.*` file. Theme tokens (colors, fonts) are defined in `app/globals.css` via the `@theme inline` block and CSS variables; dark mode follows `prefers-color-scheme`.
- Path alias: `@/*` maps to the repo root (`tsconfig.json`).

## Next.js 16 — verify against bundled docs

Per AGENTS.md, version-matched docs are at `node_modules/next/dist/docs/` (`01-app/` covers the App Router: getting-started, guides, api-reference). Read the relevant page before writing Next.js code — APIs differ from older versions. Example of a breaking rename: middleware is now **Proxy** (`proxy.ts` at the project root exporting a `proxy` function, not `middleware.ts`).
