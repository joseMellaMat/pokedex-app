import {
  getContrastTextColor,
  getDarkestTypeColor,
  getTypeColor,
  getTypeGradient,
} from "./typeColors.ts";

describe("getTypeColor", () => {
  it("returns the official color for known types", () => {
    expect(getTypeColor("fire")).toBe("#EE8130");
    expect(getTypeColor("water")).toBe("#6390F0");
  });

  it("is case-insensitive", () => {
    expect(getTypeColor("Fire")).toBe("#EE8130");
  });

  it("falls back for unknown types", () => {
    expect(getTypeColor("unknown")).toBe("#A8A77A");
  });
});

describe("getContrastTextColor", () => {
  it.each([
    ["#FFFFFF", "black"],
    ["#F7D02C", "black"],
    ["#000000", "white"],
    ["#735797", "white"],
  ])("maps %s to %s", (background, expected) => {
    expect(getContrastTextColor(background)).toBe(expected);
  });

  it("falls back to black for invalid hex", () => {
    expect(getContrastTextColor("not-a-color")).toBe("black");
  });
});

describe("getDarkestTypeColor", () => {
  it("returns the color of a single type", () => {
    expect(getDarkestTypeColor(["fire"])).toBe("#EE8130");
  });

  it("returns the darkest of two types", () => {
    expect(getDarkestTypeColor(["electric", "ghost"])).toBe("#735797");
  });

  it("falls back for an empty list", () => {
    expect(getDarkestTypeColor([])).toBe("#A8A77A");
  });
});

describe("getTypeGradient", () => {
  it("returns null for an empty list", () => {
    expect(getTypeGradient([])).toBeNull();
  });

  it("returns an rgba color for a single type", () => {
    expect(getTypeGradient(["fire"])).toBe("rgba(238, 129, 48, 0.35)");
  });

  it("returns a hard-split gradient for two types", () => {
    const gradient = getTypeGradient(["fire", "water"]);
    expect(gradient).toContain("linear-gradient(to right, ");
    expect(gradient).toContain(
      "rgba(238, 129, 48, 0.35) 0%, rgba(238, 129, 48, 0.35) 50%",
    );
    expect(gradient).toContain(
      "rgba(99, 144, 240, 0.35) 50%, rgba(99, 144, 240, 0.35) 100%",
    );
  });

  it("uses only the first two types when given three", () => {
    expect(getTypeGradient(["fire", "water", "grass"])).toBe(
      getTypeGradient(["fire", "water"]),
    );
  });
});
