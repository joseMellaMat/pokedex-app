import { useEffect } from "react";
import type { MouseEvent } from "react";
import { usePokemonDetail } from "../hooks/usePokemonDetail.ts";
import { ErrorMessage } from "./ui/ErrorMessage.tsx";
import { Spinner } from "./ui/Spinner.tsx";

interface PokemonModalProps {
  pokemonId: number | null;
  onClose: () => void;
}

function capitalizeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function PokemonModal({ pokemonId, onClose }: PokemonModalProps) {
  const { pokemon, loading, error } = usePokemonDetail(pokemonId);

  useEffect(() => {
    if (pokemonId === null) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pokemonId, onClose]);

  if (pokemonId === null) {
    return null;
  }

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  if (loading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
        onMouseDown={handleOverlayMouseDown}
      >
        <div className="w-full max-w-2xl rounded-lg border-2 border-black bg-white p-6">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error !== null || pokemon === null) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
        onMouseDown={handleOverlayMouseDown}
      >
        <div className="w-full max-w-2xl rounded-lg border-2 border-black bg-white p-6">
          <ErrorMessage
            message="Error al cargar. Cierra e inténtalo de nuevo."
            onRetry={onClose}
            actionLabel="Cerrar"
          />
        </div>
      </div>
    );
  }

  const dexNumber = `#${String(pokemon.id).padStart(4, "0")}`;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pokemon-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="pokemon-modal-title" className="text-2xl font-bold">
            {dexNumber} {capitalizeName(pokemon.name)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 rounded-lg border-2 border-black bg-gray-100 p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p>Contenido del modal próximamente</p>
      </div>
    </div>
  );
}
