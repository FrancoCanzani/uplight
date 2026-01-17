import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { NewMonitorForm } from "@/features/monitors/forms/new-monitor-form";

export const Route = createFileRoute("/(dashboard)/$teamId/monitors/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-8 w-full lg:max-w-4xl mx-auto">
      <PageHeader title="New Monitor" />
      <NewMonitorForm />
    </div>
  );
}
