/* eslint-disable react-refresh/only-export-components -- provider and consumer hook live together by design (single-file context pattern) */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const FAVORITES_STORAGE_KEY = "pokedex-favorites";

interface FavoritesContextValue {
  favorites: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((item): item is number => typeof item === "number")
  );
}

function loadFavorites(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isNumberArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    if (import.meta.env.DEV) {
      console.warn("Could not read favorites from localStorage.");
    }
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(loadFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      if (import.meta.env.DEV) {
        console.warn("Could not persist favorites to localStorage.");
      }
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (id: number): boolean => favorites.includes(id),
    [favorites],
  );

  const toggleFavorite = useCallback((id: number): void => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
    );
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({ favorites, isFavorite, toggleFavorite }),
    [favorites, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (context === null) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
