# AGENTS.md

Pokédex App — a React 19 + TypeScript + Vite + Tailwind v4 web app that
consumes PokéAPI. See `SPECS.md` for functional scope and `ARCHITECTURE.md`
for folder structure.

## Commands
- `npm run dev` — dev server with HMR
- `npm run build` — typecheck (`tsc -b`) + `vite build`; always use to verify
- `npm run lint` — ESLint (`dist/` is globally ignored)
- `npm run preview` — preview production build
- No test runner, CI workflow, or formatter is configured. Do not add one unasked.

## Code conventions
- Strict TypeScript. Never use `any`. If a type is unknown, use `unknown` and narrow.
- Components: named exports, files in PascalCase (`PokemonCard.tsx`).
- Hooks: `use` prefix, files in camelCase (`usePokemonList.ts`).
- Types and interfaces: in `src/types/`, exported as `interface Pokemon { ... }`.
- Styling: Tailwind classes only. No CSS modules, no per-component `.css` files.
- Comments: only to explain "why", not "what".

## Hard rules
- **Never** hardcode API URLs outside `src/lib/pokeapi.ts`.
- **Always** type API responses in `src/types/pokemon.ts`.
- **Never** use `useEffect` without cleanup (abort in-flight fetches on unmount).
- UI components must not know how data is fetched. They receive props.
- Do not install new libraries, formatters, test runners, or CI workflows without asking.

## Workflow
- Work in small features. No mass refactors without asking.
- Before writing code, read `SPECS.md` and `ARCHITECTURE.md` for context.
- If a task is ambiguous, ask before assuming.

## Structure
- Entry: `index.html` → `src/main.tsx` (StrictMode + `createRoot`) → `src/App.tsx`
- Styling: Tailwind v4 CSS-first — `src/index.css` starts with `@import "tailwindcss"`; plugin wired in `vite.config.ts` via `@tailwindcss/vite`. There is no `tailwind.config.js` / PostCSS config; extend theme with `@theme` in CSS, not JS config.
- Assets: `src/assets/`, static files in `public/` (served at `/`, e.g. `/icons.svg`, `/favicon.svg`).

## TypeScript gotchas (`tsconfig.app.json` + `tsconfig.node.json` via project references)
- `verbatimModuleSyntax: true` — type-only imports must use `import type`.
- `erasableSyntaxOnly: true` — no enums, namespaces, or parameter properties.
- `noUnusedLocals` / `noUnusedParameters` — unused vars fail `npm run build`.
- `moduleResolution: bundler`, `allowImportingTsExtensions: true` — use `.ts`/`.tsx` extensions only where required; match existing import style.
- Target `es2023`, JSX `react-jsx` (no `import React` needed).

## Lint
- Flat config in `eslint.config.js`: `tseslint.configs.recommended` (not type-checked), `react-hooks` flat recommended, `react-refresh` vite. Only `**/*.{ts,tsx}` are linted.