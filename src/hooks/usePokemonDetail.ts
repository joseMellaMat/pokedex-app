import { useEffect, useState } from "react";
import {
  fetchEvolutionChain,
  fetchPokemon,
  fetchSpecies,
} from "../lib/pokeapi.ts";
import type {
  EvolutionChain,
  PokemonDetail,
  PokemonSpecies,
} from "../types/pokemon.ts";

export interface UsePokemonDetailResult {
  pokemon: PokemonDetail | null;
  species: PokemonSpecies | null;
  evolution: EvolutionChain | null;
  loading: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function usePokemonDetail(id: number | null): UsePokemonDetailResult {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [evolution, setEvolution] = useState<EvolutionChain | null>(null);
  // Starts true so the first paint on open is the spinner, never the error branch.
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) {
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    const pokemonId: number = id;
    async function loadDetail(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const pokemonData = await fetchPokemon(pokemonId, signal);
        if (signal.aborted) {
          return;
        }
        const speciesData = await fetchSpecies(
          pokemonData.species.name,
          signal,
        );
        if (signal.aborted) {
          return;
        }
        const evolutionData = await fetchEvolutionChain(
          speciesData.evolution_chain.url,
          signal,
        );
        if (signal.aborted) {
          return;
        }
        setPokemon(pokemonData);
        setSpecies(speciesData);
        setEvolution(evolutionData);
        setError(null);
      } catch (err) {
        if (signal.aborted || isAbortError(err)) {
          return;
        }
        setError(getErrorMessage(err));
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }
    void loadDetail();
    return () => {
      controller.abort();
    };
  }, [id]);

  if (id === null) {
    return { pokemon: null, species: null, evolution: null, loading: false, error: null };
  }

  return { pokemon, species, evolution, loading, error };
}
