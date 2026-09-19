export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16" role="status">
      <svg
        className="h-12 w-12 animate-spin"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#000000" strokeWidth="3" />
        <path d="M2 24a22 22 0 0 1 44 0 Z" fill="#ef4444" />
        <rect x="2" y="22" width="44" height="4" fill="#000000" />
        <circle cx="24" cy="24" r="6" fill="#ffffff" stroke="#000000" strokeWidth="3" />
        <circle cx="24" cy="24" r="2.5" fill="#000000" />
      </svg>
      <p className="mt-4 text-sm font-semibold dark:text-white">Cargando...</p>
    </div>
  );
}
