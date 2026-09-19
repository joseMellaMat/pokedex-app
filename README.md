# Pokédex App
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Una Pokédex web responsiva construida con React, TypeScript y Vite que permite explorar Pokémon, buscar por nombre, filtrar por tipo, ver detalles completos (stats, habilidades, evoluciones) y guardar favoritos sin necesidad de crear una cuenta. Incluye dark mode y está cubierta por 67 tests.

**[Ver demo en vivo](https://pokedex-app-delta-blush.vercel.app/)**

![Vista principal de la Pokédex](./docs/screenshots/grid.png)

## Características

### Exploración

- Búsqueda por nombre (parcial, soporta formas alternativas como
  `pikachu-rock-star`)
- Filtro por tipo con **intersección** — solo muestra Pokémon que
  tienen **todos** los tipos seleccionados
- Filtro "Solo favoritos" que se combina con los demás con AND
- Paginación configurable: 10, 25, 50 o 100 Pokémon por página
- Scroll automático al inicio al cambiar de página

### Vista de detalle (modal)

- Cabecera con número de Pokédex, nombre, botón de favorito y cerrar
- Sprites normales y shiny (frente y espalda)
- Tipos con colores oficiales y contraste calculado por luminancia WCAG
- Stats base con barras visuales proporcionales
- Habilidades normales y ocultas (con badge distintivo)
- Altura y peso en unidades humanas
- Cadena de evoluciones clicables
- **Formas alternativas** (Mega, Gigantamax, regionales y otras)
  clicables

### Sistema de favoritos

- Persistencia en `localStorage` bajo la clave `pokedex-favorites`
- Sobrevive recargas de página y sesiones
- La lista se actualiza en vivo cuando se marca/desmarca un favorito
  con el filtro activo

### Diseño visual

### Diseño visual

- **Dark mode** con persistencia y script FOUC-free
- Gradientes por tipo en las tarjetas (mitad-y-mitad para Pokémon
  duales, como Charizard Fire/Flying)
- Imágenes con fallback en cascada: official artwork → silueta negra →
  placeholder con "?"
- Estilo neo-brutalist coherente en ambos modos (bordes y sombras
  invertidos en dark)
- Favicon de Pokébola
- Responsive (mobile-first)

### Accesibilidad

- **Focus trap** en el modal: Tab y Shift+Tab ciclan entre los
  elementos del modal sin escapar a la página de fondo
- Focus inicial en el botón de cerrar al abrir el modal
- Focus restoration a la tarjeta original al cerrar
- Body scroll lock cuando el modal está abierto
- Cierre con `Escape`, click en overlay o botón X
- ARIA labels y roles correctos (`role="dialog"`, `aria-modal`,
  `aria-pressed`, `aria-label`)

### Estados de UI

- Loading con Pokébola girando
- Error con mensaje y botón "Reintentar" (o "Cerrar" según el contexto)
- Empty state condicional: mensaje específico según si hay filtros
  activos, sin favoritos o sin resultados

## Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite
- **Estilos**: Tailwind CSS v4 (CSS-first, con variante `dark` por clase)
- **Datos**: [PokéAPI](https://pokeapi.co/) (REST, sin autenticación)
- **Estado**: React hooks + Context API (favoritos y tema)
- **Persistencia**: `localStorage` (favoritos y tema)
- **Testing**: Vitest + React Testing Library (67 tests)
- **CI**: GitHub Actions (tests + build + lint en cada PR)
- **Deploy**: Vercel

## Cómo empezar

```bash
git clone https://github.com/joseMellaMat/pokedex-app.git
cd pokedex-app
npm install
npm run dev
```
Abre http://localhost:5173 en tu navegador.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Typecheck (`tsc -b`) + build de producción |
| `npm run test` | Vitest en modo waatch |
| `npm run test:run` | Vitest one-shot (para CI) |
| `npm run lint` | Ejecuta ESLint |
| `npm run preview` | Previsualiza el build de producción |

## Arquitectura

El proyecto sigue una separación clara de responsabilidades. Las dependencias fluyen en una sola dirección: `components` → `hooks` → `lib` → `API`.

```text
src/
├── components/       # Componentes de UI (reciben props, no fetchean)
│   └── ui/           # Reutilizables (Spinner, ErrorMessage)
├── hooks/            # Lógica de estado y datos
├── lib/              # Lógica pura (fetch, colores, formato)
├── context/          # Estado global (favoritos, tema)
└── types/            # Tipos e interfaces TypeScript
```

Más detalles sobre las decisiones de diseño en ARCHITECTURE.md.

## Estrategia de datos

La app carga el índice completo de Pokémon una vez al montar (GET /pokemon?limit=100000) y trabaja en memoria para búsqueda, filtro y paginación. Los detalles se cargan bajo demanda:

- Tipos para los gradientes de las tarjetas: solo los ids visibles, en chunks de 6, con caché monotónica.
- Detalle completo del modal: solo cuando el usuario abre un Pokémon.

Este diseño elimina el problema N+1 de hacer un fetch por tarjeta y permite búsqueda instantánea sin debounce.

## Testing

67 tests sobre las capas críticas:

- **lib/ (33 tests)**: funciones puras como formatName, getTypeColor, getContrastTextColor, getTypeGradient, extractIdFromResourceUrl, getAlternateForms.
- **context/ (18 tests)**: useFavorites y useTheme con Provider wrapper y aislamiento de localStorage.
- **components/ (5 tests)**: cascada de fallback de PokemonCardImage.
- **hooks/ (11 tests)**: usePokemonIndex con mock parcial de la capa API y Deferred para verificar abort en unmount.

Ejecutar `npm run test:run` para correrlos todos.

## CI

El workflow `.github/workflows/ci.yml` corre en cada push a `main` y en cada Pull Request:

1. `npm ci` (instalación limpia desde el lockfile)
2. `npm run test:run`
3. `npm run build`
4. `npm run lint`

El merge a `main` está **bloqueado** por branch protection si el CI falla. Vercel gnera Preview Deployments automáticos para cada PR.

## Proceso de desarrollo

Este proyecto fue construido usando OpenCode (un agente de IA para desarrollo) con un flujo estructurado por archivos de contexto que gobiernan el comportamiento del agente:

- **AGENTS.md** — Convenciones de código, comandos, reglas duras y flujo de trabajo
- **SPECS.md** — Alcance funcional, endpoints de API y criterios de aceptación
- **ARCHITECTURE.md** — Decisiones técnicas, estructura de carpetas y estrategia de datos

Cada feature se planifica en modo Plan (sin escribir código), se revisa, y solo entonces pasa a modo Build. Todas las verificaciones pasan por `npm run test:run`,`npm run build` y `npm run lint` antes de commitear, siguiendo Conventional Commits.

El desarrollo posterior al MVP se organizó con Feature Branch Workflow: cada feature en su propia rama, con Preview Deployment en Vercel y CI de GitHub Actions antes del merge a `main`.

## Capturas 

### Vista principal (light mode)
<img src="./docs/screenshots/grid.png" alt="Vista Modal" width="320" />

### Vista principal (dark mode)
<img src="./docs/screenshots/dark-mode.png" alt="Vista Modal" width="320" />

### Modal de detalle
<img src="./docs/screenshots/modal.png" alt="Vista Modal" width="320" />

### Filtro por tipo activo
<img src="./docs/screenshots/filter.png" alt="Vista filtros" width="320" />

### Favoritos
<img src="./docs/screenshots/favorites.png" alt="Vista favoritos" width="320" />

### Vista mobile
<img src="./docs/screenshots/mobile.png" alt="Vista mobile" width="320" />

## Deploy

El proyecto se despliega automáticamente en Vercel con cada push a `main`. Los Pull Requests generan **Preview Deployments** con URLs únicas para verificar cambios antes de mergear.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más detalles.
