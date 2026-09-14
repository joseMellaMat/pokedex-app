## Known UX debt (post-MVP)
- Empty state message should differentiate between "no results" and
  "no Pokémon matches all selected types" (the intersection case).

## Modal improvements (post-5B.1)
- Retry button in modal should refetch without closing the modal.
  Currently it says "Cerrar" and closes.
- Focus trap and body scroll lock when modal is open.
- Consolidate padStart(4, "0") + capitalize into lib/format.ts if
  they appear in a third place.