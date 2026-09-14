interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
  actionLabel?: string;
}

export function ErrorMessage({
  message,
  onRetry,
  actionLabel = "Reintentar",
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="mb-4 font-semibold">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border-2 border-black bg-gray-100 px-4 py-2 font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        {actionLabel}
      </button>
    </div>
  );
}
