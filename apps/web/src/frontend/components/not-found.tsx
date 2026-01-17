import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <div className="p-8 max-w-md w-full space-y-6">
        <div className="space-y-2">
          <h1 className="font-medium uppercase tracking-wide text-xl">
            404
          </h1>
          <span className="text-muted-foreground">Page not found</span>
        </div>
        <p className="text-sm text-foreground/80">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="text-sm hover:underline underline-offset-4 inline-block"
        >
          Go home →
        </Link>
      </div>
    </div>
  );
}
