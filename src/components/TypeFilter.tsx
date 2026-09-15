import { formatName } from "../lib/format.ts";
import {
  POKEMON_TYPES,
  getContrastTextColor,
  getTypeColor,
} from "../lib/typeColors.ts";

interface TypeFilterProps {
  selected: string[];
  onToggle: (type: string) => void;
}

export function TypeFilter({ selected, onToggle }: TypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
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
            className={`rounded-lg border-2 border-black px-3 py-1 text-sm font-semibold ${
              isActive ? textColor : "bg-gray-100 text-black"
            }`}
          >
            {formatName(type)}
          </button>
        );
      })}
    </div>
  );
}
