import { formatName } from "../lib/format.ts";
import {
  getContrastTextColor,
  getDarkestTypeColor,
  getTypeGradient,
} from "../lib/typeColors.ts";
import type { PokemonIndexEntry } from "../types/pokemon.ts";
import { PokemonCardImage } from "./PokemonCardImage.tsx";

interface PokemonCardProps {
  pokemon: PokemonIndexEntry;
  onClick: () => void;
  types?: string[];
}

export function PokemonCard({ pokemon, onClick, types }: PokemonCardProps) {
  const displayName = formatName(pokemon.name);
  const dexNumber = `#${String(pokemon.id).padStart(4, "0")}`;
  const hasTypes = types !== undefined && types.length > 0;
  const gradient = hasTypes ? getTypeGradient(types) : null;
  const textColor =
    hasTypes &&
    getContrastTextColor(getDarkestTypeColor(types)) === "white"
      ? "text-white"
      : "text-black";

  return (
    <button
      type="button"
      onClick={onClick}
      style={gradient !== null ? { background: gradient } : undefined}
      className={`flex w-full cursor-pointer flex-col items-center rounded-lg border-2 border-black bg-gray-100 p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 ${textColor}`}
    >
      <PokemonCardImage id={pokemon.id} alt={displayName} />
      <span className="block font-semibold">{displayName}</span>
      <span className="block text-sm opacity-70">{dexNumber}</span>
    </button>
  );
}
