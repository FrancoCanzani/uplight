import { Link } from "@tanstack/react-router";

export function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  info?: { componentStack: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-surface flex items-center justify-center">
      <div className="border shadow-xs bg-background p-8 max-w-md w-full space-y-6">
        <div className="space-y-2">
          <h1 className="font-medium uppercase tracking-wide text-xl">
            Error
          </h1>
          <p className="text-muted-foreground">Something went wrong</p>
        </div>
        <p className="text-sm text-foreground/80">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={reset}
            className="text-sm hover:underline underline-offset-4"
          >
            Try again
          </button>
          <span className="text-muted-foreground">·</span>
          <Link
            to="/"
            className="text-sm hover:underline underline-offset-4"
          >
            Go home →
          </Link>
        </div>
      </div>
    </div>
  );
}
