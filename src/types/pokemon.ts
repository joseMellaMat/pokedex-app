export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonSprites {
  front_default: string | null;
  back_default: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  other: {
    "official-artwork": {
      front_default: string | null;
    };
  };
}

export interface PokemonTypeSlot {
  slot: number;
  type: NamedApiResource;
}

export interface PokemonStat {
  base_stat: number;
  stat: NamedApiResource;
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: NamedApiResource;
}

export interface PokemonIndexEntry {
  name: string;
  id: number;
}

export interface PokemonIndexResponse {
  count: number;
  results: PokemonIndexEntry[];
}

export interface RawPokemonIndexResponse {
  count: number;
  results: NamedApiResource[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  species: NamedApiResource;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
}

export interface PokemonSpecies {
  id: number;
  name: string;
  evolution_chain: {
    url: string;
  };
}

export interface EvolutionChainLink {
  species: NamedApiResource;
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionChainLink;
}

export interface PokemonTypeEntry {
  pokemon: NamedApiResource;
}

export interface PokemonTypeResponse {
  pokemon: PokemonTypeEntry[];
}

export type PageSize = 10 | 25 | 50 | 100;
