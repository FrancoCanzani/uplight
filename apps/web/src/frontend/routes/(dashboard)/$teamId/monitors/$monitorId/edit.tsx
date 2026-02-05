import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import fetchMonitor from "@/features/monitors/api/fetch-monitor";
import { HttpMonitorForm } from "@/features/monitors/forms/http-monitor-form";
import { TcpMonitorForm } from "@/features/monitors/forms/tcp-monitor-form";

export const Route = createFileRoute(
  "/(dashboard)/$teamId/monitors/$monitorId/edit",
)({
  loader: async ({ params }) => {
    const monitor = await fetchMonitor(params.teamId, params.monitorId);
    return { monitor };
  },
  component: EditMonitorPage,
});

function EditMonitorPage() {
  const { monitor } = Route.useLoaderData();

  return (
    <div className="space-y-8 w-full lg:max-w-4xl mx-auto px-4 lg:px-6 pb-20 md:pb-6">
      <PageHeader title="Edit Monitor" />
      {monitor.type === "tcp" ? (
        <TcpMonitorForm monitor={monitor} />
      ) : (
        <HttpMonitorForm monitor={monitor} />
      )}
    </div>
  );
}
