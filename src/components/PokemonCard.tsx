import { getPokemonSpriteUrl } from "../lib/pokeapi.ts";
import type { PokemonIndexEntry } from "../types/pokemon.ts";

interface PokemonCardProps {
  pokemon: PokemonIndexEntry;
}

function capitalizeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const displayName = capitalizeName(pokemon.name);
  const dexNumber = `#${String(pokemon.id).padStart(4, "0")}`;

  return (
    <article className="flex flex-col items-center rounded-lg border-2 border-black bg-gray-100 p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <img
        src={getPokemonSpriteUrl(pokemon.id)}
        alt={displayName}
        loading="lazy"
        className="h-24 w-24"
      />
      <h2 className="font-semibold">{displayName}</h2>
      <p className="text-sm text-gray-600">{dexNumber}</p>
    </article>
  );
}
