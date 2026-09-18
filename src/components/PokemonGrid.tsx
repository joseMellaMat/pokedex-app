import { PokemonCard } from "./PokemonCard.tsx";
import type { PokemonIndexEntry } from "../types/pokemon.ts";

interface PokemonGridProps {
  pokemons: PokemonIndexEntry[];
  onSelect: (id: number) => void;
  typesById: Map<number, string[]>;
}

export function PokemonGrid({ pokemons, onSelect, typesById }: PokemonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {pokemons.map((pokemon) => (
        <PokemonCard
          key={`${pokemon.id}-${pokemon.name}`}
          pokemon={pokemon}
          onClick={() => onSelect(pokemon.id)}
          types={typesById.get(pokemon.id)}
        />
      ))}
    </div>
  );
}
