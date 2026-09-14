import type {
  EvolutionChain,
  PokemonDetail,
  PokemonIndexEntry,
  PokemonIndexResponse,
  PokemonSpecies,
  PokemonTypeResponse,
  RawPokemonIndexResponse,
} from "../types/pokemon.ts";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

export function extractIdFromResourceUrl(url: string): number | null {
  const match = /\/pokemon\/(\d+)\/?$/.exec(url);
  const idText = match?.[1];
  if (idText === undefined) {
    return null;
  }
  const id = Number(idText);
  return Number.isNaN(id) ? null : id;
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.url}`);
  }
  return (await response.json()) as T;
}

export async function fetchFullIndex(
  signal?: AbortSignal,
): Promise<PokemonIndexResponse> {
  const raw = await fetchJson<RawPokemonIndexResponse>(
    `${POKEAPI_BASE_URL}/pokemon?limit=100000&offset=0`,
    signal,
  );
  const results: PokemonIndexEntry[] = [];
  for (const entry of raw.results) {
    const id = extractIdFromResourceUrl(entry.url);
    if (id === null) {
      continue;
    }
    results.push({ name: entry.name, id });
  }
  return { count: raw.count, results };
}

export async function fetchPokemon(
  nameOrId: string | number,
  signal?: AbortSignal,
): Promise<PokemonDetail> {
  return fetchJson<PokemonDetail>(
    `${POKEAPI_BASE_URL}/pokemon/${nameOrId}`,
    signal,
  );
}

export async function fetchSpecies(
  nameOrId: string | number,
  signal?: AbortSignal,
): Promise<PokemonSpecies> {
  return fetchJson<PokemonSpecies>(
    `${POKEAPI_BASE_URL}/pokemon-species/${nameOrId}`,
    signal,
  );
}

// The URL comes from species.evolution_chain.url, so it is passed through as-is.
export async function fetchEvolutionChain(
  url: string,
  signal?: AbortSignal,
): Promise<EvolutionChain> {
  return fetchJson<EvolutionChain>(url, signal);
}

export async function fetchPokemonByType(
  typeName: string,
  signal?: AbortSignal,
): Promise<PokemonTypeResponse> {
  return fetchJson<PokemonTypeResponse>(
    `${POKEAPI_BASE_URL}/type/${typeName.toLowerCase()}`,
    signal,
  );
}
