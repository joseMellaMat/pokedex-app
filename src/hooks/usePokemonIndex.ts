import { useEffect, useMemo, useState } from "react";
import {
  extractIdFromResourceUrl,
  fetchFullIndex,
  fetchPokemonByType,
} from "../lib/pokeapi.ts";
import type {
  PokemonIndexEntry,
  PokemonTypeResponse,
} from "../types/pokemon.ts";

export type PageSize = 10 | 25 | 50 | 100;

export interface UsePokemonIndexResult {
  visiblePokemons: PokemonIndexEntry[];
  loading: boolean;
  error: string | null;
  typeFilterLoading: boolean;
  typeFilterError: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTypes: string[];
  toggleType: (typeName: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: PageSize;
  setPageSize: (size: PageSize) => void;
  totalFiltered: number;
  totalPages: number;
  retry: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

function applyTextFilter(
  entries: PokemonIndexEntry[],
  query: string,
): PokemonIndexEntry[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === "") {
    return entries;
  }
  return entries.filter((entry) =>
    entry.name.toLowerCase().includes(normalized),
  );
}

function buildTypeIdSet(response: PokemonTypeResponse): Set<number> {
  const ids = new Set<number>();
  for (const entry of response.pokemon) {
    const id = extractIdFromResourceUrl(entry.pokemon.url);
    if (id !== null) {
      ids.add(id);
    }
  }
  return ids;
}

function applyTypeFilter(
  entries: PokemonIndexEntry[],
  idSets: Set<number>[],
): PokemonIndexEntry[] {
  if (idSets.length === 0) {
    return entries;
  }
  return entries.filter((entry) =>
    idSets.every((idSet) => idSet.has(entry.id)),
  );
}

function paginate(
  entries: PokemonIndexEntry[],
  page: number,
  pageSize: PageSize,
): PokemonIndexEntry[] {
  const start = (page - 1) * pageSize;
  if (start < 0) {
    return [];
  }
  return entries.slice(start, start + pageSize);
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function usePokemonIndex(): UsePokemonIndexResult {
  const [index, setIndex] = useState<PokemonIndexEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQueryState] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [typeIdSets, setTypeIdSets] = useState<Set<number>[]>([]);
  const [typeFilterLoading, setTypeFilterLoading] = useState<boolean>(false);
  const [typeFilterError, setTypeFilterError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<PageSize>(10);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    async function loadIndex(): Promise<void> {
      setLoading(true);
      try {
        const data = await fetchFullIndex(signal);
        if (signal.aborted) {
          return;
        }
        setIndex(data.results);
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
    void loadIndex();
    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  useEffect(() => {
    if (selectedTypes.length === 0) {
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    async function loadTypes(): Promise<void> {
      setTypeFilterLoading(true);
      setTypeFilterError(null);
      try {
        const responses = await Promise.all(
          selectedTypes.map((typeName) => fetchPokemonByType(typeName, signal)),
        );
        if (signal.aborted) {
          return;
        }
        setTypeIdSets(responses.map(buildTypeIdSet));
      } catch (err) {
        if (signal.aborted || isAbortError(err)) {
          return;
        }
        setTypeIdSets([]);
        setTypeFilterError(getErrorMessage(err));
      } finally {
        if (!signal.aborted) {
          setTypeFilterLoading(false);
        }
      }
    }
    void loadTypes();
    return () => {
      controller.abort();
    };
  }, [selectedTypes]);

  function setSearchQuery(query: string): void {
    setSearchQueryState(query);
    setPage(1);
  }

  function toggleType(typeName: string): void {
    const normalized = typeName.trim().toLowerCase();
    if (normalized === "") {
      return;
    }
    const next = selectedTypes.includes(normalized)
      ? selectedTypes.filter((type) => type !== normalized)
      : [...selectedTypes, normalized];
    setSelectedTypes(next);
    if (next.length === 0) {
      setTypeIdSets([]);
      setTypeFilterError(null);
      setTypeFilterLoading(false);
    }
    setPage(1);
  }

  function setPageSize(size: PageSize): void {
    setPageSizeState(size);
    setPage(1);
  }

  function retry(): void {
    setError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  const textFiltered = useMemo(
    () => applyTextFilter(index, searchQuery),
    [index, searchQuery],
  );
  const filtered = useMemo(
    () => applyTypeFilter(textFiltered, typeIdSets),
    [textFiltered, typeIdSets],
  );
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const visiblePokemons = useMemo(
    () => paginate(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  return {
    visiblePokemons,
    loading,
    error,
    typeFilterLoading,
    typeFilterError,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    toggleType,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalFiltered,
    totalPages,
    retry,
  };
}
