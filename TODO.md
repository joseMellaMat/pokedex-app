# TODO

## v2 — Complete (merged to production)

Todas las mejoras de v2 están mergeadas. Ver `SPECS.md §Status` para
el listado completo.

## Post-v2 backlog (nice to have)

- Modal: retry real sin cerrar (requiere exponer retry() desde
  usePokemonDetail).
- Focus restoration fallback a un elemento seguro cuando la tarjeta
  original se desmontó.
- Placeholder de imágenes con silhouette general cuando no hay
  sprite ni artwork (hoy muestra "?").
- Búsqueda por número de Pokédex (hoy solo por nombre).
- Tests de componentes adicionales (PokemonCard, PokemonGrid,
  Pagination, ThemeToggle).
- Tests de integración con Testing Library sobre App completo.
- Cobertura de `usePokemonDetail` con mock de los 3 fetches
  encadenados.

## Decisiones explícitas (no hacer)

- No agregar analytics ni telemetría.
- No agregar backend: la app es 100% client-side por diseño.
- No migrar a Redux/Zustand: Context + hooks es suficiente.
- No agregar React Router: el modal es estado local por diseño.