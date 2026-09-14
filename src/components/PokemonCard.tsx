import { getPokemonSpriteUrl } from "../lib/pokeapi.ts";
import type { PokemonIndexEntry } from "../types/pokemon.ts";

interface PokemonCardProps {
  pokemon: PokemonIndexEntry;
  onClick: () => void;
}

function capitalizeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const displayName = capitalizeName(pokemon.name);
  const dexNumber = `#${String(pokemon.id).padStart(4, "0")}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col items-center rounded-lg border-2 border-black bg-gray-100 p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
    >
      <img
        src={getPokemonSpriteUrl(pokemon.id)}
        alt={displayName}
        loading="lazy"
        className="h-24 w-24"
      />
      <span className="block font-semibold">{displayName}</span>
      <span className="block text-sm text-gray-600">{dexNumber}</span>
    </button>
  );
}
