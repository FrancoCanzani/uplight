import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <header className="p-2 flex items-center justify-end">
      <Link to="/dashboard/monitors/new">New Monitor</Link>
    </header>
  );
}
