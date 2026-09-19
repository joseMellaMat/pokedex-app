import { useState } from "react";
import {
  getOfficialArtworkUrl,
  getPokemonSpriteUrl,
} from "../lib/pokeapi.ts";

interface PokemonCardImageProps {
  id: number;
  alt: string;
}

export function PokemonCardImage({ id, alt }: PokemonCardImageProps) {
  const [step, setStep] = useState<number>(0);

  function advanceStep(): void {
    setStep((prev) => Math.min(prev + 1, 2));
  }

  if (step >= 2) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded bg-gray-200 dark:bg-gray-700">
        <span
          aria-hidden="true"
          className="text-5xl leading-none font-bold text-black select-none dark:text-white"
        >
          ?
        </span>
      </div>
    );
  }

  if (step === 1) {
    return (
      <img
        src={getPokemonSpriteUrl(id)}
        alt={alt}
        loading="lazy"
        onError={advanceStep}
        className="h-24 w-24 [filter:brightness(0)]"
      />
    );
  }

  return (
    <img
      src={getOfficialArtworkUrl(id)}
      alt={alt}
      loading="lazy"
      onError={advanceStep}
      className="h-24 w-24"
    />
  );
}
