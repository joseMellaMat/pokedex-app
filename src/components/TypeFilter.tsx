import { formatName } from "../lib/format.ts";
import {
  POKEMON_TYPES,
  getContrastTextColor,
  getTypeColor,
} from "../lib/typeColors.ts";

// TypeFilter now owns the entire filter row. If a third filter is added, rename to FilterBar.
interface TypeFilterProps {
  selected: string[];
  onToggle: (type: string) => void;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
}

export function TypeFilter({
  selected,
  onToggle,
  showOnlyFavorites,
  onToggleFavorites,
}: TypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 dark:text-white">
      <button
        type="button"
        onClick={onToggleFavorites}
        aria-pressed={showOnlyFavorites}
        className={`rounded-lg border-2 border-black px-3 py-1 text-sm font-semibold dark:border-white ${
          showOnlyFavorites ? "bg-[#F7D02C] text-black" : "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
        }`}
      >
        Solo favoritos
      </button>
      {POKEMON_TYPES.map((type) => {
        const isActive = selected.includes(type);
        const backgroundColor = getTypeColor(type);
        const textColor =
          getContrastTextColor(backgroundColor) === "white"
            ? "text-white"
            : "text-black";
        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            aria-pressed={isActive}
            style={isActive ? { backgroundColor } : undefined}
            className={`rounded-lg border-2 border-black px-3 py-1 text-sm font-semibold dark:border-white ${
              isActive ? textColor : "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
            }`}
          >
            {formatName(type)}
          </button>
        );
      })}
    </div>
  );
}
