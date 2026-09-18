import { formatName } from "./format.ts";

describe("formatName", () => {
  it("capitalizes a single word", () => {
    expect(formatName("pikachu")).toBe("Pikachu");
  });

  it.each([
    ["solar-power", "Solar Power"],
    ["mr-mime", "Mr Mime"],
    ["tapu-fini", "Tapu Fini"],
    ["charizard-mega-x", "Charizard Mega X"],
  ])("converts kebab-case %s to Title Case %s", (input, expected) => {
    expect(formatName(input)).toBe(expected);
  });

  it("returns an empty string unchanged", () => {
    expect(formatName("")).toBe("");
  });
});
