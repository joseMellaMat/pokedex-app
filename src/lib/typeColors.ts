export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

const TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const FALLBACK_TYPE_COLOR = "#A8A77A";

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type.toLowerCase() as PokemonTypeName] ?? FALLBACK_TYPE_COLOR;
}

// WCAG relative luminance decides whether black or white text is readable.
function relativeLuminance(hexColor: string): number | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hexColor.trim());
  if (match?.[1] === undefined) {
    return null;
  }
  const hex = match[1];
  const channels = [0, 2, 4].map((offset) => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return (
    0.2126 * (channels[0] ?? 0) +
    0.7152 * (channels[1] ?? 0) +
    0.0722 * (channels[2] ?? 0)
  );
}

export function getContrastTextColor(hexColor: string): "black" | "white" {
  const luminance = relativeLuminance(hexColor);
  if (luminance === null) {
    return "black";
  }
  return luminance > 0.179 ? "black" : "white";
}

export function getDarkestTypeColor(types: string[]): string {
  let darkest = FALLBACK_TYPE_COLOR;
  let lowest = Number.POSITIVE_INFINITY;
  for (const type of types) {
    const color = getTypeColor(type);
    const luminance = relativeLuminance(color) ?? Number.POSITIVE_INFINITY;
    if (luminance < lowest) {
      lowest = luminance;
      darkest = color;
    }
  }
  return darkest;
}

function hexToRgba(hexColor: string, alpha: number): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hexColor.trim());
  if (match?.[1] === undefined) {
    return hexColor;
  }
  const hex = match[1];
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getTypeGradient(types: string[], alpha = 0.35): string | null {
  if (types.length === 0) {
    return null;
  }
  const [first, second] = types.slice(0, 2);
  if (first === undefined) {
    return null;
  }
  const firstColor = hexToRgba(getTypeColor(first), alpha);
  if (second === undefined) {
    return firstColor;
  }
  const secondColor = hexToRgba(getTypeColor(second), alpha);
  return `linear-gradient(to right, ${firstColor} 0%, ${firstColor} 50%, ${secondColor} 50%, ${secondColor} 100%)`;
}
