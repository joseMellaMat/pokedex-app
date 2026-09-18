import { formatName } from "../lib/format.ts";
import type { PokemonIndexEntry } from "../types/pokemon.ts";
import { PokemonCardImage } from "./PokemonCardImage.tsx";

interface PokemonCardProps {
  pokemon: PokemonIndexEntry;
  onClick: () => void;
}

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const displayName = formatName(pokemon.name);
  const dexNumber = `#${String(pokemon.id).padStart(4, "0")}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col items-center rounded-lg border-2 border-black bg-gray-100 p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
    >
      <PokemonCardImage id={pokemon.id} alt={displayName} />
      <span className="block font-semibold">{displayName}</span>
      <span className="block text-sm text-gray-600">{dexNumber}</span>
    </button>
  );
}
