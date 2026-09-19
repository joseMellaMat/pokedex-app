import { useEffect, useRef } from "react";
import type { MouseEvent, RefObject } from "react";
import { useModalFocus } from "../hooks/useModalFocus.ts";
import { usePokemonDetail } from "../hooks/usePokemonDetail.ts";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock.ts";
import { formatName } from "../lib/format.ts";
import { useFavorites } from "../context/FavoritesContext.tsx";
import { extractIdFromResourceUrl, getAlternateForms } from "../lib/pokeapi.ts";
import {
  getContrastTextColor,
  getTypeColor,
} from "../lib/typeColors.ts";
import type {
  EvolutionChain,
  EvolutionChainLink,
  PokemonAbility,
  PokemonSpecies,
  PokemonSprites,
  PokemonStat,
  PokemonTypeSlot,
} from "../types/pokemon.ts";
import { ErrorMessage } from "./ui/ErrorMessage.tsx";
import { Spinner } from "./ui/Spinner.tsx";

interface PokemonModalProps {
  pokemonId: number | null;
  onClose: () => void;
  onSelect: (id: number) => void;
}

interface EvolutionEntry {
  id: number;
  name: string;
}

const STAT_LABELS: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. Especial",
  "special-defense": "Def. Especial",
  speed: "Velocidad",
};

function flattenEvolutionChain(root: EvolutionChainLink): EvolutionEntry[] {
  const entries: EvolutionEntry[] = [];
  function visit(node: EvolutionChainLink): void {
    const id = extractIdFromResourceUrl(node.species.url);
    if (id !== null) {
      entries.push({ id, name: node.species.name });
    }
    for (const next of node.evolves_to) {
      visit(next);
    }
  }
  visit(root);
  return entries;
}

function TypeBadges({ types }: { types: PokemonTypeSlot[] }) {
  const ordered = [...types].sort((a, b) => a.slot - b.slot);
  return (
    <section>
      <h3 className="mb-2 font-bold">Tipos</h3>
      <div className="flex gap-2">
        {ordered.map((slot) => {
          const backgroundColor = getTypeColor(slot.type.name);
          const textColor =
            getContrastTextColor(backgroundColor) === "white"
              ? "text-white"
              : "text-black";
          return (
            <span
              key={slot.type.name}
              style={{ backgroundColor }}
              className={`rounded-lg border-2 border-black px-3 py-1 text-sm font-semibold ${textColor}`}
            >
              {formatName(slot.type.name)}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function SpriteGallery({ sprites }: { sprites: PokemonSprites }) {
  const cells: { src: string | null; label: string }[] = [
    { src: sprites.front_default, label: "Normal" },
    { src: sprites.back_default, label: "Espalda" },
    { src: sprites.front_shiny, label: "Shiny" },
    { src: sprites.back_shiny, label: "Shiny espalda" },
  ];
  return (
    <section>
      <h3 className="mb-2 font-bold">Sprites</h3>
      <div className="grid grid-cols-4 gap-2">
        {cells.map((cell) => (
          <div key={cell.label} className="flex flex-col items-center">
            {cell.src !== null ? (
              <img
                src={cell.src}
                alt={cell.label}
                loading="lazy"
                className="h-20 w-20"
              />
            ) : (
              <div className="h-20 w-20 rounded bg-gray-200" />
            )}
            <span className="text-xs text-gray-600 dark:text-gray-300">{cell.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PhysicalInfo({ height, weight }: { height: number; weight: number }) {
  return (
    <section>
      <h3 className="mb-2 font-bold">Altura y peso</h3>
      <div className="flex gap-4">
        <p>Altura: {(height / 10).toFixed(1)} m</p>
        <p>Peso: {(weight / 10).toFixed(1)} kg</p>
      </div>
    </section>
  );
}

function StatBars({ stats }: { stats: PokemonStat[] }) {
  return (
    <section>
      <h3 className="mb-2 font-bold">Estadísticas</h3>
      <div className="flex flex-col gap-1">
        {stats.map((stat) => (
          <div key={stat.stat.name} className="flex items-center gap-2">
            <span className="w-28 text-sm">
              {STAT_LABELS[stat.stat.name] ?? formatName(stat.stat.name)}
            </span>
            <span className="w-10 text-right font-semibold tabular-nums">
              {stat.base_stat}
            </span>
            <div className="h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (stat.base_stat / 255) * 100)}%`,
                  backgroundColor: "#6390F0",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AbilityList({ abilities }: { abilities: PokemonAbility[] }) {
  return (
    <section>
      <h3 className="mb-2 font-bold">Habilidades</h3>
      <div className="flex flex-wrap gap-2">
        {abilities.map((entry) => (
          <span
            key={entry.ability.name}
            className="flex items-center gap-1 rounded-lg border-2 border-black bg-gray-100 px-3 py-1 text-sm font-semibold dark:border-white dark:bg-gray-800"
          >
            {formatName(entry.ability.name)}
            {entry.is_hidden && (
              <span className="rounded bg-amber-200 px-1.5 py-0.5 text-xs text-black">
                Oculta
              </span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}

function NavigationChip({
  id,
  name,
  currentId,
  onSelect,
}: {
  id: number;
  name: string;
  currentId: number;
  onSelect: (id: number) => void;
}) {
  if (id === currentId) {
    return (
      <span
        className="cursor-not-allowed rounded-lg border-2 border-black bg-gray-100 px-3 py-1 text-sm font-semibold opacity-50 dark:border-white dark:bg-gray-800"
      >
        {formatName(name)}
      </span>
    );
  }
  return (
      <button
        type="button"
        onClick={() => onSelect(id)}
        className="rounded-lg border-2 border-black bg-gray-100 px-3 py-1 text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-gray-800 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      >
      {formatName(name)}
    </button>
  );
}

function EvolutionList({
  evolution,
  currentId,
  onSelect,
}: {
  evolution: EvolutionChain | null;
  currentId: number;
  onSelect: (id: number) => void;
}) {
  const entries =
    evolution === null ? [] : flattenEvolutionChain(evolution.chain);
  return (
    <section>
      <h3 className="mb-2 font-bold">Evoluciones</h3>
      {entries.length <= 1 ? (
        <p>Este Pokémon no evoluciona.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {entries.map((entry) => (
            <NavigationChip
              key={`${entry.id}-${entry.name}`}
              id={entry.id}
              name={entry.name}
              currentId={currentId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AlternateForms({
  species,
  currentId,
  onSelect,
}: {
  species: PokemonSpecies;
  currentId: number;
  onSelect: (id: number) => void;
}) {
  const forms = getAlternateForms(species);
  if (forms.length === 0) {
    return null;
  }
  return (
    <section>
      <h3 className="mb-2 font-bold">Formas alternativas</h3>
      <div className="flex flex-wrap gap-2">
        {forms.flatMap((form) => {
          const id = extractIdFromResourceUrl(form.url);
          if (id === null) {
            return [];
          }
          return [
            <NavigationChip
              key={`${id}-${form.name}`}
              id={id}
              name={form.name}
              currentId={currentId}
              onSelect={onSelect}
            />,
          ];
        })}
      </div>
    </section>
  );
}

interface ModalHeaderFavorite {
  isFavorite: boolean;
  onToggle: () => void;
}

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  favorite?: ModalHeaderFavorite;
}

function ModalHeader({ title, onClose, closeButtonRef, favorite }: ModalHeaderProps) {
  const favoriteLabel = favorite?.isFavorite
    ? "Quitar de favoritos"
    : "Añadir a favoritos";
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <h2 id="pokemon-modal-title" className="flex-1 text-2xl font-bold">
        {title}
      </h2>
      {favorite !== undefined && (
        <button
          key="favorite"
          type="button"
          onClick={favorite.onToggle}
          aria-pressed={favorite.isFavorite}
            aria-label={favoriteLabel}
            title={favoriteLabel}
            className="shrink-0 rounded-lg border-2 border-black bg-gray-100 p-1 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-gray-800 dark:text-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill={favorite.isFavorite ? "#F7D02C" : "none"}
            stroke="#000000"
            strokeWidth="2"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11.48 3.52c.16-.4.88-.4 1.04 0l2.12 5.11 5.52.44c.44.04.62.58.28.85l-4.2 3.6 1.28 5.38c.1.43-.36.76-.74.53L12 16.54l-4.78 2.89c-.38.23-.84-.1-.74-.53l1.28-5.38-4.2-3.6c-.34-.27-.16-.81.28-.85l5.52-.44 2.12-5.11z" />
          </svg>
        </button>
      )}
      <button
        key="close"
        type="button"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 rounded-lg border-2 border-black bg-gray-100 p-1 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-gray-800 dark:text-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export function PokemonModal({ pokemonId, onClose, onSelect }: PokemonModalProps) {
  const { pokemon, species, evolution, loading, error } = usePokemonDetail(pokemonId);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (pokemonId === null) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pokemonId, onClose]);

  useBodyScrollLock(pokemonId !== null);

  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useModalFocus(containerRef, pokemonId !== null, closeButtonRef);

  if (pokemonId === null) {
    return null;
  }

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  if (loading) {
    return (
      <div
        ref={containerRef}
        tabIndex={-1}
        className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
        onMouseDown={handleOverlayMouseDown}
      >
        <div className="w-full max-w-2xl rounded-lg border-2 border-black bg-white p-6 dark:border-white dark:bg-gray-900 dark:text-white">
          <ModalHeader
            title="Cargando..."
            onClose={onClose}
            closeButtonRef={closeButtonRef}
          />
          <Spinner />
        </div>
      </div>
    );
  }

  if (error !== null || pokemon === null) {
    return (
      <div
        ref={containerRef}
        tabIndex={-1}
        className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
        onMouseDown={handleOverlayMouseDown}
      >
        <div className="w-full max-w-2xl rounded-lg border-2 border-black bg-white p-6 dark:border-white dark:bg-gray-900 dark:text-white">
          <ModalHeader
            title="Error"
            onClose={onClose}
            closeButtonRef={closeButtonRef}
          />
          <ErrorMessage
            message="Error al cargar. Cierra e inténtalo de nuevo."
            onRetry={onClose}
            actionLabel="Cerrar"
          />
        </div>
      </div>
    );
  }

  const dexNumber = `#${String(pokemon.id).padStart(4, "0")}`;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pokemon-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-gray-900 dark:text-white dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
      >
        <ModalHeader
          title={`${dexNumber} ${formatName(pokemon.name)}`}
          onClose={onClose}
          closeButtonRef={closeButtonRef}
          favorite={{
            isFavorite: isFavorite(pokemon.id),
            onToggle: () => toggleFavorite(pokemon.id),
          }}
        />
        <div className="space-y-6">
          <TypeBadges types={pokemon.types} />
          <SpriteGallery sprites={pokemon.sprites} />
          <PhysicalInfo height={pokemon.height} weight={pokemon.weight} />
          <StatBars stats={pokemon.stats} />
          <AbilityList abilities={pokemon.abilities} />
          <EvolutionList
            evolution={evolution}
            currentId={pokemon.id}
            onSelect={onSelect}
          />
          {species !== null && (
            <AlternateForms
              species={species}
              currentId={pokemon.id}
              onSelect={onSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
