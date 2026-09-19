# SPECS.md — Pokédex Frontend

## Objective
A responsive Pokédex web app for Spanish-speaking users that lets them
explore, search by name, filter by type, save favorites, and view Pokémon
details (stats, height, weight, types, abilities, hidden ability, and
evolutions). No account, no backend, favorites persist between sessions
via `localStorage`.

## Functional Scope (MVP)

### 0. Initial index load
- On app mount, a single call to `GET /pokemon?limit=100000&offset=0`
  fetches the full index of Pokémon names and URLs (~1,300 entries).
- This index lives in memory and powers search, filter, and pagination.
- Pokémon details (sprites, stats, types) are loaded on demand, only for
  the Pokémon currently visible on screen.

### 1. Paginated list
- Display Pokémon in a grid of cards.
- User can choose page size: 10, 25, 50, or 100.
- Each card shows: sprite, name, and National Pokédex number.
- Types and type-based gradients are NOT shown on cards in the MVP.
  They appear only in the detail modal.
- (Future) Lazy loading with IntersectionObserver will allow type-based
  card styling without hitting the API on every page render.

### 2. Search
- Input searches by full or partial name.
- Filtering runs client-side on the in-memory index (no debounce needed).

### 3. Type filter
- User can filter by one or more types (fire, water, grass, etc.).
- Multi-type Pokémon appear under any of their types.
- Implemented by calling `GET /type/{name}` once per selected type and
  intersecting the result with the local index.

### 4. Detail modal
- Clicking a card opens a modal with:
  - Name, National Pokédex number.
  - Normal sprite and shiny sprites (front and back).
  - Types (with distinct colors).
  - Base stats (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed).
  - Abilities: normal abilities and hidden ability (marked with a badge).
  - Evolutions (clickable to navigate to the evolved Pokémon).
  - Height and weight.

### 5. Favorites
- User can toggle a Pokémon as favorite.
- Favorites are stored in `localStorage` under the key `pokedex-favorites`.
- On reload, favorites are restored.

### 6. UI states
- **Loading**: spinning Pokéball while waiting for a response.
- **Error**: error screen with a message and a "Retry" button.
- **No results**: "No se encontraron Pokémon" message when search or
  filter yields nothing.

## API Endpoints
- `GET https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0` — Full index (once at startup).
- `GET https://pokeapi.co/api/v2/pokemon/{name-or-id}` — Pokémon detail.
- `GET https://pokeapi.co/api/v2/pokemon-species/{name-or-id}` — Species data (for evolution).
- `GET https://pokeapi.co/api/v2/evolution-chain/{id}` — Full evolution chain.
- `GET https://pokeapi.co/api/v2/type/{name}` — Pokémon of a given type (on filter).

## Language rules
- **Code identifiers** (file names, variables, functions, types, components):
  always English.
- **UI text shown to the user**: always Spanish.
- **Context files** (this file, `AGENTS.md`, `ARCHITECTURE.md`): English.

## Acceptance Criteria
- [ ] On first load, the app fetches the full index and displays 10 Pokémon by default.
- [ ] The user can change page size to 25, 50, or 100.
- [ ] Typing "pika" shows Pikachu and its alternate forms, and no Pokémon whose name does not contain "pika".
- [ ] Selecting the "fire" filter shows only Pokémon whose types include "fire", paginated by the current page size.
- [ ] Clicking Pikachu opens a modal showing its stats, abilities (including hidden), types, height, weight, sprites (normal + shiny, front + back), and evolution chain.
- [ ] Evolution entries in the modal are clickable and navigate to that Pokémon's detail.
- [ ] The favorite button toggles state and persists across page reloads.
- [ ] The app is responsive (usable on mobile and desktop).
- [ ] No network errors and no React warnings in the console during load, search, filter, and modal interactions.
- [ ] Each card displays only sprite, name, and Pokédex number.
- [ ] No network request is made per card when rendering a page of the list.

## Status
**Complete.** Todas las funcionalidades del MVP y las mejoras de v2 están implementadas, testeadas y en producción:

- Búsqueda, filtro por tipo (intersección), filtro "solo favoritos", paginación configurable.
- Modal de detalle con sprites, stats, habilidades, evoluciones y formas alternativas.
- Sistema de favoritos con persistencia.
- Dark mode con persistencia.
- Accesibilidad completa de teclado (focus trap, restauración).
- 67 tests automatizados.
- CI con GitHub Actions (tests + build + lint).

**Deuda conocida (post-v2):**
- El retry del modal cierra en lugar de refetchear sin cerrar.
- Focus trap: si el Pokémon abierto se desmarca como favorito con "solo favoritos" activo, la restauración de foco cae a body.
- Los chips de evolución de formas alternativas comparan por id; las formas sin id matcheable no se marcan como "actual".