import { act, renderHook, waitFor } from "@testing-library/react";
import { fetchFullIndex, fetchPokemonByType } from "../lib/pokeapi.ts";
import type {
  PokemonIndexEntry,
  PokemonIndexResponse,
  PokemonTypeResponse,
} from "../types/pokemon.ts";
import { usePokemonIndex } from "./usePokemonIndex.ts";

vi.mock("../lib/pokeapi.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/pokeapi.ts")>();
  return {
    ...actual,
    fetchFullIndex: vi.fn(),
    fetchPokemonByType: vi.fn(),
  };
});

const fetchFullIndexMock = vi.mocked(fetchFullIndex);
const fetchPokemonByTypeMock = vi.mocked(fetchPokemonByType);

const TEST_INDEX: PokemonIndexEntry[] = [
  { name: "bulbasaur", id: 1 },
  { name: "ivysaur", id: 2 },
  { name: "venusaur", id: 3 },
  { name: "charmander", id: 4 },
  { name: "charmeleon", id: 5 },
  { name: "charizard", id: 6 },
  { name: "squirtle", id: 7 },
  { name: "pikachu", id: 25 },
  { name: "raichu", id: 26 },
  { name: "mewtwo", id: 150 },
  { name: "mew", id: 151 },
  { name: "pidgey", id: 16 },
];

const TEST_INDEX_RESPONSE: PokemonIndexResponse = {
  count: TEST_INDEX.length,
  results: TEST_INDEX,
};

const FIRE_TYPE_RESPONSE: PokemonTypeResponse = {
  pokemon: [
    {
      pokemon: {
        name: "charmander",
        url: "https://pokeapi.co/api/v2/pokemon/4/",
      },
    },
    {
      pokemon: {
        name: "charmeleon",
        url: "https://pokeapi.co/api/v2/pokemon/5/",
      },
    },
    {
      pokemon: {
        name: "charizard",
        url: "https://pokeapi.co/api/v2/pokemon/6/",
      },
    },
  ],
};

const SEARCH_CASES: Array<[string, Array<string>]> = [
  ["pika", ["pikachu"]],
  ["PIKA", ["pikachu"]],
  ["char", ["charmander", "charmeleon", "charizard"]],
];

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.resetAllMocks();
  fetchFullIndexMock.mockResolvedValue(TEST_INDEX_RESPONSE);
});

describe("usePokemonIndex", () => {
  describe("initial load", () => {
    it("starts loading and then shows the first page", async () => {
      const { result } = renderHook(() => usePokemonIndex());
      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeNull();
      expect(result.current.totalFiltered).toBe(12);
      expect(result.current.totalPages).toBe(2);
      expect(result.current.visiblePokemons).toHaveLength(10);
    });
  });

  describe("network error", () => {
    it("sets the error message and stops loading", async () => {
      fetchFullIndexMock.mockRejectedValueOnce(new Error("Network error"));
      const { result } = renderHook(() => usePokemonIndex());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Network error");
      expect(result.current.visiblePokemons).toEqual([]);
    });
  });

  describe("text search", () => {
    it.each(SEARCH_CASES)(
      "filters by partial case-insensitive name %s",
      async (query, expected) => {
        const { result } = renderHook(() => usePokemonIndex());
        await waitFor(() => expect(result.current.loading).toBe(false));
        act(() => {
          result.current.setSearchQuery(query);
        });
        expect(result.current.visiblePokemons.map((p) => p.name)).toEqual(
          expected,
        );
      },
    );
  });

  describe("pagination", () => {
    it("paginates with the default page size", async () => {
      const { result } = renderHook(() => usePokemonIndex());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.pageSize).toBe(10);
      expect(result.current.page).toBe(1);
      expect(result.current.visiblePokemons.map((p) => p.id)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 25, 26, 150,
      ]);
      act(() => {
        result.current.setPage(2);
      });
      expect(result.current.page).toBe(2);
      expect(result.current.visiblePokemons.map((p) => p.id)).toEqual([
        151, 16,
      ]);
    });
  });

  describe("type filter", () => {
    it("intersects the index with the type results", async () => {
      fetchPokemonByTypeMock.mockResolvedValue(FIRE_TYPE_RESPONSE);
      const { result } = renderHook(() => usePokemonIndex());
      await waitFor(() => expect(result.current.loading).toBe(false));
      act(() => {
        result.current.toggleType("fire");
      });
      expect(fetchPokemonByTypeMock).toHaveBeenCalledWith(
        "fire",
        expect.any(AbortSignal),
      );
      expect(result.current.selectedTypes).toEqual(["fire"]);
      await waitFor(() =>
        expect(result.current.typeFilterLoading).toBe(false),
      );
      expect(result.current.visiblePokemons.map((p) => p.name)).toEqual([
        "charmander",
        "charmeleon",
        "charizard",
      ]);
    });
  });

  describe("favorites filter", () => {
    it("shows only the ids in filterIds", async () => {
      const { result } = renderHook(() => usePokemonIndex([25]));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.totalFiltered).toBe(1);
      expect(result.current.visiblePokemons.map((p) => p.name)).toEqual([
        "pikachu",
      ]);
    });

    it("clamps the page when filterIds shrink the results", async () => {
      const { result, rerender } = renderHook(
        ({ filterIds }) => usePokemonIndex(filterIds),
        { initialProps: { filterIds: null as number[] | null } },
      );
      await waitFor(() => expect(result.current.loading).toBe(false));
      act(() => {
        result.current.setPage(2);
      });
      expect(result.current.page).toBe(2);
      rerender({ filterIds: [1, 2, 3] });
      expect(result.current.page).toBe(1);
      expect(result.current.visiblePokemons.map((p) => p.id)).toEqual([
        1, 2, 3,
      ]);
    });
  });

  describe("retry", () => {
    it("clears the error and fetches again", async () => {
      fetchFullIndexMock.mockRejectedValueOnce(new Error("Network error"));
      const { result } = renderHook(() => usePokemonIndex());
      await waitFor(() => expect(result.current.error).toBe("Network error"));
      act(() => {
        result.current.retry();
      });
      expect(result.current.error).toBeNull();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(fetchFullIndexMock).toHaveBeenCalledTimes(2);
      expect(result.current.visiblePokemons).toHaveLength(10);
    });
  });

  describe("abort on unmount", () => {
    it("aborts the in-flight fetch and never updates state", async () => {
      const deferred = createDeferred<PokemonIndexResponse>();
      fetchFullIndexMock.mockReturnValue(deferred.promise);
      const { result, unmount } = renderHook(() => usePokemonIndex());
      expect(fetchFullIndexMock).toHaveBeenCalledTimes(1);
      unmount();
      const signal = fetchFullIndexMock.mock.calls[0]?.[0];
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal?.aborted).toBe(true);
      deferred.resolve(TEST_INDEX_RESPONSE);
      await waitFor(() => expect(result.current.error).toBeNull());
      expect(result.current.loading).toBe(true);
      expect(result.current.visiblePokemons).toEqual([]);
      expect(fetchFullIndexMock).toHaveBeenCalledTimes(1);
    });
  });
});
