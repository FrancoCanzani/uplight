import { createFileRoute } from "@tanstack/react-router";
import { NewMonitorForm } from "@/features/monitors/forms/new-monitor-form";

export const Route = createFileRoute("/dashboard/monitors/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create New Monitor
        </h1>
        <p className="text-muted-foreground mt-1">
          Set up a new uptime monitor for your service.
        </p>
      </div>
      <NewMonitorForm />
    </div>
  );
}
