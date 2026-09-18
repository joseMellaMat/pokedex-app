import { useEffect, useState } from "react";
import { fetchPokemon } from "../lib/pokeapi.ts";

const CONCURRENCY_LIMIT = 6;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function fetchTypeNames(
  id: number,
  signal: AbortSignal,
): Promise<[number, string[]]> {
  try {
    const pokemon = await fetchPokemon(id, signal);
    return [id, pokemon.types.map((slot) => slot.type.name)];
  } catch (error) {
    if (signal.aborted || isAbortError(error)) {
      throw error;
    }
    // Mark as loaded with no types so a failing id is never retried.
    return [id, []];
  }
}

export function usePokemonTypes(ids: number[]): {
  typesById: Map<number, string[]>;
} {
  const [typesById, setTypesById] = useState<Map<number, string[]>>(
    () => new Map(),
  );

  useEffect(() => {
    const missing = ids.filter((id) => !typesById.has(id));
    if (missing.length === 0) {
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    async function loadTypes(): Promise<void> {
      try {
        for (let offset = 0; offset < missing.length; offset += CONCURRENCY_LIMIT) {
          if (signal.aborted) {
            return;
          }
          const chunk = missing.slice(offset, offset + CONCURRENCY_LIMIT);
          const results = await Promise.all(
            chunk.map((id) => fetchTypeNames(id, signal)),
          );
          if (signal.aborted) {
            return;
          }
          setTypesById((prev) => {
            const next = new Map(prev);
            for (const [id, names] of results) {
              next.set(id, names);
            }
            return next;
          });
        }
      } catch (error) {
        if (signal.aborted || isAbortError(error)) {
          return;
        }
      }
    }
    void loadTypes();
    return () => {
      controller.abort();
    };
    // typesById intentionally omitted: the cache only grows, so the
    // snapshot above never goes stale within a run. Adding it would
    // restart the loop on every progressive commit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  return { typesById };
}
