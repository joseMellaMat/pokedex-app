import { fireEvent, render, screen } from "@testing-library/react";
import { getOfficialArtworkUrl, getPokemonSpriteUrl } from "../lib/pokeapi.ts";
import { PokemonCardImage } from "./PokemonCardImage.tsx";

describe("PokemonCardImage", () => {
  it("renders the official artwork initially", () => {
    render(<PokemonCardImage id={25} alt="Pikachu" />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      getOfficialArtworkUrl(25),
    );
  });

  it("falls back to the silhouetted sprite after an error", () => {
    render(<PokemonCardImage id={25} alt="Pikachu" />);
    fireEvent.error(screen.getByRole("img"));
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", getPokemonSpriteUrl(25));
    expect(image.className).toContain("brightness(0)");
  });

  it("falls back to the placeholder after a second error", () => {
    render(<PokemonCardImage id={25} alt="Pikachu" />);
    fireEvent.error(screen.getByRole("img"));
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("keeps the same alt across the image steps", () => {
    render(<PokemonCardImage id={25} alt="Pikachu" />);
    const artworkAlt = screen.getByRole("img").getAttribute("alt");
    fireEvent.error(screen.getByRole("img"));
    const spriteAlt = screen.getByRole("img").getAttribute("alt");
    expect(artworkAlt).toBe("Pikachu");
    expect(spriteAlt).toBe("Pikachu");
    expect(spriteAlt).toBe(artworkAlt);
  });

  it("hides the placeholder mark from assistive technology", () => {
    render(<PokemonCardImage id={25} alt="Pikachu" />);
    fireEvent.error(screen.getByRole("img"));
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("?")).toHaveAttribute("aria-hidden", "true");
  });
});
