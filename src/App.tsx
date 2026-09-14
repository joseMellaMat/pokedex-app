import { PokemonGrid } from "./components/PokemonGrid.tsx";
import { ErrorMessage } from "./components/ui/ErrorMessage.tsx";
import { Spinner } from "./components/ui/Spinner.tsx";
import { usePokemonIndex } from "./hooks/usePokemonIndex.ts";

function App() {
  const { visiblePokemons, loading, error, retry } = usePokemonIndex();

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-bold">Pokédex</h1>
        {loading ? (
          <Spinner />
        ) : error !== null ? (
          <ErrorMessage message={error} onRetry={retry} />
        ) : (
          <PokemonGrid pokemons={visiblePokemons} />
        )}
      </main>
    </div>
  );
}

export default App;
