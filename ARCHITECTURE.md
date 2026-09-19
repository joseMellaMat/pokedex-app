# ARCHITECTURE.md — Pokédex App

## Stack
- **Frontend**: React 19 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS v4 (CSS-first, no `tailwind.config.js`)
- **Data**: PokéAPI (REST, public, no auth)
- **State**: React hooks (`useState`, `useEffect`) + Context API for favorites.
  No Redux, no Zustand, no React Query for the MVP.
- **Persistence**: `localStorage` for favorites (`pokedex-favorites`)
  and theme (`pokedex-theme`) only.

## Core strategy: full index in memory

The app fetches the **full Pokémon index once** on mount:
`GET /pokemon?limit=100000&offset=0` (~1,300 entries, ~100 KB).

This index lives in memory and powers:
- Search by name (client-side, no debounce needed).
- Pagination (client-side, instant).
- Type filter (intersected with `GET /type/{name}` results).

Pokémon details (sprites, stats, types) are loaded **on demand**:
- Only when the user opens a modal.
- Never per card in the list.

**Why this strategy:**
- Search by partial name is impossible with the paginated endpoint.
- 1,300 entries in memory is negligible (~100 KB).
- Eliminates the N+1 problem of fetching details per card.
- No debounce needed because there is no network call per keystroke.

Card type gradients (implemented): type-based gradients on cards are
fetched lazily via `usePokemonTypes` (chunks of 6, monotonic cache)
so the index itself stays `{ name, id }`-only.

## Folder structure

```text
src/
├── components/
│ ├── ui/ # Dumb, reusable components (props only)
│ │ ├── Spinner.tsx # Spinning Pokéball + "Cargando..."
│ │ └── ErrorMessage.tsx # Message + retry button (actionLabel?)
│ ├── PokemonCard.tsx # Button card: image + name + dex number (+ types gradient)
│ ├── PokemonCardImage.tsx # Artwork → silhouette → "?" cascade (+ .test)
│ ├── PokemonGrid.tsx # Responsive grid, passes typesById down
│ ├── PokemonModal.tsx # Detail modal: full sections + focus trap + favorites
│ ├── SearchBar.tsx # Controlled search input
│ ├── ThemeToggle.tsx # Sun/moon button, consumes useTheme()
│ ├── TypeFilter.tsx # Owns the entire filter row (types + favorites chip)
│ └── Pagination.tsx # Prev/next + page-size select
│
├── hooks/
│ ├── usePokemonIndex.ts # Index + search + type filter + favorites filter + pagination (+ .test)
│ ├── usePokemonDetail.ts # Chained: pokemon → species → evolution
│ ├── usePokemonTypes.ts # Visible ids → types cache (chunks of 6)
│ ├── useModalFocus.ts # Initial focus + trap + restoration (refs only)
│ └── useBodyScrollLock.ts # Locks body scroll while the modal is open
│
├── lib/
│ ├── pokeapi.ts # fetch* + get*Url + extractIdFromResourceUrl + getAlternateForms (+ .test)
│ ├── typeColors.ts # POKEMON_TYPES + getTypeColor/Contrast/Darkest/Gradient (+ .test)
│ └── format.ts # formatName: kebab-case → Title Case (+ .test)
│
├── context/
│ ├── FavoritesContext.tsx # FavoritesProvider + useFavorites (+ .test)
│ └── ThemeContext.tsx # ThemeProvider + useTheme (+ .test)
│
├── types/
│ └── pokemon.ts # All TypeScript interfaces + PageSize
│
├── App.tsx # Composition: controls + grid + pagination + modal
├── main.tsx # Entry (FavoritesProvider > ThemeProvider > App)
├── index.css # Tailwind + class-based dark variant + body bg
└── test-setup.ts # jest-dom/vitest + matchMedia stub
```

**Note:** `components/ui/` and `context/` are the **destination**, not the
starting point. Early on, components can live flat in `components/`.
Move them to `ui/` once 3+ dumb components exist.

## Data flow

```text
App.tsx
└── usePokemonIndex()
├── lib/pokeapi.ts → fetchFullIndex() (once on mount)
├── lib/pokeapi.ts → fetchPokemonByType() (on type filter)
└── returns { visiblePokemons, loading, error, search, setSearch, ... }

└── usePokemonDetail(selectedId)
├── lib/pokeapi.ts → fetchPokemon(id)
├── lib/pokeapi.ts → fetchSpecies(id)
├── lib/pokeapi.ts → fetchEvolutionChain(id)
└── returns { pokemon, species, evolution, loading, error }

└── useFavorites()
└── localStorage + Context
```

**Rule:** components never call `fetch` directly. All network calls go
through `lib/pokeapi.ts`. Components receive data and callbacks as props.

## Key decisions

### 1. `usePokemonIndex` is monolithic (for now)
It handles index loading, text search, type filtering, and pagination.
Internal helper functions keep it readable. When it grows past ~150 lines
or a responsibility changes for a different reason, split into:
`usePokemonIndex` (core), `useTextFilter`, `useTypeFilter`, `usePagination`.

### 2. Type filter logic lives in `lib/pokeapi.ts` (the call) and
`usePokemonIndex` (the intersection). No separate hook in the MVP.

### 3. `usePokemonDetail` chains three calls

 fetchPokemon(id)
     → extract species.name (slug que fetchSpecies espera)
     → fetchSpecies(name)
     → extract evolution_chain.url (URL absoluta, passthrough)
     → fetchEvolutionChain(url)
Returns `{ pokemon, species, evolution, loading, error }`. All three
calls use the same `AbortController` so unmounting cancels everything.

### 4. Favorites via Context, not prop drilling
Favorites are needed in `PokemonCard` (future) and `PokemonModal` (MVP).
Context API avoids passing `isFavorite` and `toggleFavorite` through
`App → Grid → Card`. No external state library needed.

### 5. No routing in the MVP
The modal is controlled by `selectedPokemon` state in `App.tsx`.
No React Router. If deep linking becomes necessary, add it later.

## Error and loading strategy

- Every hook returns `{ data, loading, error }`.
- **Loading**: `<Spinner />` (Pokéball).
- **Error**: `<ErrorMessage />` with a retry button that re-triggers the fetch.
- **Empty results**: a dedicated message, not an error.
- All fetches use `AbortController` and abort on unmount.

## Theming

Dark mode is class-based, never media-query driven:

- `src/index.css` registers `@custom-variant dark (&:where(.dark, .dark *))`
  (Tailwind v4 defaults `dark:` to `prefers-color-scheme`; without this
  line the toggle would do nothing) and paints `body` so overscroll
  never flashes white.
- `ThemeContext` exposes `theme: "light" | "dark"` + `toggleTheme()`.
  Initial value: `localStorage` (`"pokedex-theme"`), else
  `prefers-color-scheme` (guarded if `matchMedia` is missing). There is
  no `"system"` state: once the user toggles, the stored choice wins.
  An idempotent effect applies/removes `.dark` on
  `document.documentElement` and persists — no renders involved.
- FOUC-free boot: a minimal inline script in `index.html` repeats the
  same decision (storage → media) before first paint. The duplication
  with the provider's lazy initializer is intentional: they run at
  different moments of startup and the script must be dependency-free.
- Visual rules in dark: type gradients at 0.5 alpha (vs 0.35 in light),
  forced `text-white` on cards with types (no contrast calc), inverted
  neo-brutalist shadows (`dark:shadow-[…rgba(255,255,255,1)]` paired
  with `dark:border-white`).

## Testing

Test pyramid, cheapest first: `lib` (pure functions, best value/cost)
→ `context` (hooks with Provider + `localStorage`) → `components`
(render + events) → data hooks with mocks (logic + async). Tests live
next to their source (`*.test.ts(x)`), never in a separate folder.

- Patterns: partial `vi.mock` with `importOriginal` + `vi.mocked`
  (mock signatures checked at compile time); `Deferred` helper for
  abort tests (no timers, no races); Provider wrapper for `renderHook`;
  `it.each` for case tables; `waitFor` only across promise boundaries.
- Hard rule: tests compile under the same strict TypeScript as
  production (`tsconfig.app.json` includes `src`; `vitest/globals`
  in `types`). A test that doesn't compile in strict is a bad test.
- `matchMedia` doesn't exist in jsdom: `src/test-setup.ts` stubs it
  (light by default); individual tests override with `vi.stubGlobal`.
- Runner: Vitest (`npm run test` watch, `npm run test:run` one-shot
  for CI).

## Language rules

- **Code identifiers** (files, variables, functions, types, components):
  English.
- **UI text shown to the user**: Spanish.
- **Context files** (`AGENTS.md`, `SPECS.md`, `ARCHITECTURE.md`): English.