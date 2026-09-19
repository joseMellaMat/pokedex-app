import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia: default stub reports light mode. Tests that
// need dark system preference override it with vi.stubGlobal.
vi.stubGlobal(
  "matchMedia",
  vi.fn().mockImplementation(() => ({ matches: false, media: "" })),
);
