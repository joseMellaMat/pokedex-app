import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext.tsx";

// The storage key mirrors the implementation contract: hardcoded on
// purpose so the test breaks if the key ever changes.
const STORAGE_KEY = "pokedex-theme";

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({ matches, media: "" })),
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  stubMatchMedia(false);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useTheme", () => {
  describe("initial state", () => {
    it("defaults to light without storage or system preference", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      expect(result.current.theme).toBe("light");
    });

    it("uses dark when the system prefers it", () => {
      stubMatchMedia(true);
      const { result } = renderHook(() => useTheme(), { wrapper });
      expect(result.current.theme).toBe("dark");
    });

    it("prefers stored dark over a light system", () => {
      localStorage.setItem(STORAGE_KEY, "dark");
      const { result } = renderHook(() => useTheme(), { wrapper });
      expect(result.current.theme).toBe("dark");
    });

    it("prefers stored light over a dark system", () => {
      localStorage.setItem(STORAGE_KEY, "light");
      stubMatchMedia(true);
      const { result } = renderHook(() => useTheme(), { wrapper });
      expect(result.current.theme).toBe("light");
    });
  });

  describe("toggleTheme", () => {
    it("switches light to dark and persists it", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe("dark");
      expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("switches dark to light and removes the class", () => {
      localStorage.setItem(STORAGE_KEY, "dark");
      const { result } = renderHook(() => useTheme(), { wrapper });
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe("light");
      expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("outside provider", () => {
    it("throws with a clear message", () => {
      expect(() => renderHook(() => useTheme())).toThrow(
        "useTheme must be used within a ThemeProvider",
      );
    });
  });
});
