import { useEffect, useMemo, useState } from "react";
import { Pagination } from "./components/Pagination.tsx";
import { PokemonGrid } from "./components/PokemonGrid.tsx";
import { PokemonModal } from "./components/PokemonModal.tsx";
import { SearchBar } from "./components/SearchBar.tsx";
import { TypeFilter } from "./components/TypeFilter.tsx";
import { ErrorMessage } from "./components/ui/ErrorMessage.tsx";
import { Spinner } from "./components/ui/Spinner.tsx";
import { useFavorites } from "./context/FavoritesContext.tsx";
import { usePokemonIndex } from "./hooks/usePokemonIndex.ts";
import { usePokemonTypes } from "./hooks/usePokemonTypes.ts";

function App() {
  const { favorites } = useFavorites();
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const {
    visiblePokemons,
    loading,
    error,
    typeFilterLoading,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    toggleType,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalFiltered,
    totalPages,
    retry,
  } = usePokemonIndex(showOnlyFavorites ? favorites : null);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(
    null,
  );
  const visibleIds = useMemo(
    () => visiblePokemons.map((pokemon) => pokemon.id),
    [visiblePokemons],
  );
  const { typesById } = usePokemonTypes(visibleIds);

  // Scroll to top when the page changes so the user sees the new results from the start.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  function toggleShowOnlyFavorites(): void {
    setShowOnlyFavorites((value) => !value);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-bold">Pokédex</h1>
        <div className="mb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="mb-8">
          <TypeFilter
            selected={selectedTypes}
            onToggle={toggleType}
            showOnlyFavorites={showOnlyFavorites}
            onToggleFavorites={toggleShowOnlyFavorites}
          />
        </div>
        {loading ? (
          <Spinner />
        ) : error !== null ? (
          <ErrorMessage message={error} onRetry={retry} />
        ) : totalFiltered === 0 ? (
          <p className="py-16 text-center font-semibold">
            {showOnlyFavorites && favorites.length === 0 ?(
                "Aún no tienes favoritos. Marca algunos desde el detalle de un Pokémon."
            ): selectedTypes.length > 0 ?(
                "Ningún Pokémon combina todos los tipos seleccionados. Prueba quitando alguno"
            ):(
                "No se encontraron Pokémon"
            )}
          </p>
        ) : (
          <div
            className={
              typeFilterLoading ? "opacity-60 transition-opacity" : "transition-opacity"
            }
          >
            <PokemonGrid
              pokemons={visiblePokemons}
              onSelect={setSelectedPokemonId}
              typesById={typesById}
            />
          </div>
        )}
        {!loading && error === null && totalFiltered > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
        <PokemonModal
          pokemonId={selectedPokemonId}
          onClose={() => setSelectedPokemonId(null)}
          onSelect={setSelectedPokemonId}
        />
      </main>
    </div>
  );
}

export default App;
