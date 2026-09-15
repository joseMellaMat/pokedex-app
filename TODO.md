## Known UX debt (post-MVP)
- Empty state message should differentiate between "no results" and
  "no Pokémon matches all selected types" (the intersection case).

## Modal improvements (post-5B.1)
- Retry button in modal should refetch without closing the modal.
  Currently it says "Cerrar" and closes.
- Focus trap and body scroll lock when modal is open.
- Consolidate padStart(4, "0") + capitalize into lib/format.ts if
  they appear in a third place.

## Modal debt (post-5B)
- Real retry in modal: currently the button says "Cerrar" and closes.
  Should refetch without closing when usePokemonDetail exposes retry.
- Focus trap and body scroll-lock when modal is open.
- Evolution chip matching by id fails for alternate forms (Eevee Gmax
  doesn't match base Eevee id). Consider matching by species.name or
  accepting the degradation as documented.

## Workflow lessons
- `npm run build` and `npm run lint` are necessary but not sufficient.
  Always verify visually in the browser before committing, especially
  after changes to entry points like `main.tsx`.

## MVP status
- [x] Feature 1: Initial UI rendering
- [x] Feature 2: Search, filter, pagination
- [x] Feature 3: Modal shell
- [x] Feature 4: Modal content
- [x] Feature 5: Favorites context
- [x] Feature 6: Favorite toggle button

## Post-MVP polish
- Conditional empty state for type intersection.
- Body scroll-lock when modal is open.
- Focus trap in modal.
- Real retry in modal without closing.
- Type-based card gradients with lazy loading (IntersectionObserver).