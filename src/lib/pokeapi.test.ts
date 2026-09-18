import { extractIdFromResourceUrl, getAlternateForms } from "./pokeapi.ts";
import type {
  PokemonSpecies,
  PokemonSpeciesVariety,
} from "../types/pokemon.ts";

describe("extractIdFromResourceUrl", () => {
  it.each([
    [25, "https://pokeapi.co/api/v2/pokemon/25/"],
    [25, "https://pokeapi.co/api/v2/pokemon-species/25/"],
    [2, "https://pokeapi.co/api/v2/evolution-chain/2/"],
    [1000, "https://pokeapi.co/api/v2/pokemon/1000"],
  ])("extracts %d from %s", (expected, url) => {
    expect(extractIdFromResourceUrl(url)).toBe(expected);
  });

  it.each([
    "https://pokeapi.co/api/v2/pokemon/",
    "https://pokeapi.co/api/v2/pokemon/abc/",
    "not-a-url",
    "",
  ])("returns null for %s", (url) => {
    expect(extractIdFromResourceUrl(url)).toBeNull();
  });
});

describe("getAlternateForms", () => {
  function createSpecies(varieties: PokemonSpeciesVariety[]): PokemonSpecies {
    return {
      id: 6,
      name: "charizard",
      evolution_chain: {
        url: "https://pokeapi.co/api/v2/evolution-chain/2/",
      },
      varieties,
    };
  }

  it("returns only non-default varieties", () => {
    const species = createSpecies([
      {
        is_default: true,
        pokemon: { name: "charizard", url: "https://pokeapi.co/api/v2/pokemon/6/" },
      },
      {
        is_default: false,
        pokemon: {
          name: "charizard-mega-x",
          url: "https://pokeapi.co/api/v2/pokemon/10034/",
        },
      },
      {
        is_default: false,
        pokemon: {
          name: "charizard-mega-y",
          url: "https://pokeapi.co/api/v2/pokemon/10035/",
        },
      },
    ]);
    expect(getAlternateForms(species)).toEqual([
      {
        name: "charizard-mega-x",
        url: "https://pokeapi.co/api/v2/pokemon/10034/",
      },
      {
        name: "charizard-mega-y",
        url: "https://pokeapi.co/api/v2/pokemon/10035/",
      },
    ]);
  });

  it("returns an empty list when every variety is default", () => {
    const species = createSpecies([
      {
        is_default: true,
        pokemon: { name: "ditto", url: "https://pokeapi.co/api/v2/pokemon/132/" },
      },
    ]);
    expect(getAlternateForms(species)).toEqual([]);
  });

  it("returns an empty list when varieties is empty", () => {
    expect(getAlternateForms(createSpecies([]))).toEqual([]);
  });

  it("returns an empty list when varieties is missing", () => {
    // Simulates a malformed API payload: unknown shape narrowed to the expected type.
    const raw: unknown = {
      id: 6,
      name: "charizard",
      evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/2/" },
    };
    expect(getAlternateForms(raw as PokemonSpecies)).toEqual([]);
  });
});
