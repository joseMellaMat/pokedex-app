import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { FavoritesProvider, useFavorites } from "./FavoritesContext.tsx";

// The storage key is a SPECS §5 contract: hardcoded on purpose so the
// test breaks if the implementation key ever changes.
const STORAGE_KEY = "pokedex-favorites";

function wrapper({ children }: { children: ReactNode }) {
  return <FavoritesProvider>{children}</FavoritesProvider>;
}

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("useFavorites", () => {
  describe("initial state", () => {
    it("starts empty when localStorage is empty", () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });
      expect(result.current.favorites).toEqual([]);
    });

    it("restores favorites from localStorage", () => {
      localStorage.setItem(STORAGE_KEY, "[1, 2, 3]");
      const { result } = renderHook(() => useFavorites(), { wrapper });
      expect(result.current.favorites).toEqual([1, 2, 3]);
    });
  });

  describe("isFavorite", () => {
    it("returns true for a stored id", () => {
      localStorage.setItem(STORAGE_KEY, "[25]");
      const { result } = renderHook(() => useFavorites(), { wrapper });
      expect(result.current.isFavorite(25)).toBe(true);
    });

    it("returns false for an absent id", () => {
      localStorage.setItem(STORAGE_KEY, "[25]");
      const { result } = renderHook(() => useFavorites(), { wrapper });
      expect(result.current.isFavorite(1)).toBe(false);
    });
  });

  describe("toggleFavorite", () => {
    it("appends a new id at the end", () => {
      localStorage.setItem(STORAGE_KEY, "[1, 2]");
      const { result } = renderHook(() => useFavorites(), { wrapper });
      act(() => {
        result.current.toggleFavorite(3);
      });
      expect(result.current.favorites).toEqual([1, 2, 3]);
    });

    it("removes an existing id", () => {
      localStorage.setItem(STORAGE_KEY, "[1, 2, 3]");
      const { result } = renderHook(() => useFavorites(), { wrapper });
      act(() => {
        result.current.toggleFavorite(2);
      });
      expect(result.current.favorites).toEqual([1, 3]);
    });

    it("persists the change to localStorage", () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });
      act(() => {
        result.current.toggleFavorite(25);
      });
      const stored: unknown = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "[]",
      );
      expect(stored).toEqual([25]);
    });
  });

  describe("corrupt data", () => {
    it.each(["no-json", '{"foo": "bar"}'])(
      "falls back to [] for %s",
      (stored) => {
        localStorage.setItem(STORAGE_KEY, stored);
        const { result } = renderHook(() => useFavorites(), { wrapper });
        expect(result.current.favorites).toEqual([]);
      },
    );

    it("warns in DEV when the stored JSON is invalid", () => {
      // Coupled to import.meta.env.DEV === true (Vitest default). If the
      // runner ever stops defining DEV, this assertion needs adjusting.
      // Only the JSON.parse branch warns; a valid non-array stays silent.
      localStorage.setItem(STORAGE_KEY, "no-json");
      renderHook(() => useFavorites(), { wrapper });
      expect(console.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe("outside provider", () => {
    it("throws with a clear message", () => {
      expect(() => renderHook(() => useFavorites())).toThrow(
        "useFavorites must be used within a FavoritesProvider",
      );
    });
  });
});
