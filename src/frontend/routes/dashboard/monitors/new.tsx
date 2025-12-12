import { NewMonitorForm } from "@/features/monitors/forms/new-monitor-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/monitors/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-medium text-lg tracking-tight">
          Create New Monitor
        </h1>
        <p className="text-muted-foreground text-sm">
          Set up a new uptime monitor for your service.
        </p>
      </div>
      <NewMonitorForm />
    </div>
  );
}
