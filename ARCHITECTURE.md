# ARCHITECTURE.md — Pokédex App

## Stack
- **Frontend**: React 19 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS v4 (CSS-first, no `tailwind.config.js`)
- **Data**: PokéAPI (REST, public, no auth)
- **State**: React hooks (`useState`, `useEffect`) + Context API for favorites.
  No Redux, no Zustand, no React Query for the MVP.
- **Persistence**: `localStorage` for favorites only.

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

**Future migration (not MVP):** lazy loading with `IntersectionObserver`
to render type-based gradients on cards without a request per card.

## Folder structure

src/
├── components/
│ ├── ui/ # Dumb, reusable components (props only)
│ │ ├── TypeBadge.tsx # Single type badge, receives name + color
│ │ ├── Spinner.tsx # Spinning Pokéball
│ │ └── ErrorMessage.tsx # Message + retry button
│ ├── PokemonCard.tsx # Sprite + name + Pokédex number
│ ├── PokemonGrid.tsx # Grid of cards
│ ├── PokemonModal.tsx # Detail modal (types + gradient here)
│ ├── SearchBar.tsx # Search input
│ ├── TypeFilter.tsx # Type selector
│ └── Pagination.tsx # Page controls
│
├── hooks/
│ ├── usePokemonIndex.ts # Index + search + type filter + pagination
│ ├── usePokemonDetail.ts # Chained: pokemon → species → evolution
│ └── useFavorites.ts # localStorage + Context
│
├── lib/
│ ├── pokeapi.ts # All HTTP calls (the only place fetch lives)
│ └── typeColors.ts # Type → color map
│
├── context/
│ └── FavoritesContext.tsx # Favorites provider
│
├── types/
│ └── pokemon.ts # All TypeScript interfaces
│
├── App.tsx # Composition
├── main.tsx # Entry (wraps with FavoritesProvider)
└── index.css # Tailwind

**Note:** `components/ui/` and `context/` are the **destination**, not the
starting point. Early on, components can live flat in `components/`.
Move them to `ui/` once 3+ dumb components exist.

## Data flow

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

## Language rules

- **Code identifiers** (files, variables, functions, types, components):
  English.
- **UI text shown to the user**: Spanish.
- **Context files** (`AGENTS.md`, `SPECS.md`, `ARCHITECTURE.md`): English.