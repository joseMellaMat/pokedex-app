interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-gray-100 px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-gray-800 dark:text-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      <svg
        className="h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Buscar Pokémon"
        placeholder="Buscar Pokémon..."
        className="w-full bg-transparent outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
      />
    </div>
  );
}
