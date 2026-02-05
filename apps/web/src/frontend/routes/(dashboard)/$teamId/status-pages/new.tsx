import { PageHeader } from "@/components/page-header";
import StatusPageForm from "@/features/status-pages/forms/status-page-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/$teamId/status-pages/new")({
  component: NewStatusPage,
});

function NewStatusPage() {
  return (
    <div className="space-y-10 w-full lg:max-w-4xl mx-auto px-4 lg:px-6 pb-20 md:pb-6">
      <PageHeader title="Create Status Page" />
      <StatusPageForm />
    </div>
  );
}
