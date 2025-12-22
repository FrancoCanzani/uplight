import fetchMonitor from "@/features/monitors/api/fetch-monitor";
import { HttpMonitorForm } from "@/features/monitors/forms/http-monitor-form";
import { TcpMonitorForm } from "@/features/monitors/forms/tcp-monitor-form";
import { createFileRoute } from "@tanstack/react-router";

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
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <div>
        <h1 className="font-medium text-lg tracking-tight">Edit Monitor</h1>
        <p className="text-muted-foreground text-sm">
          Update the configuration for {monitor.name}.
        </p>
      </div>
      <div>
        {monitor.type === "tcp" ? (
          <TcpMonitorForm monitor={monitor} />
        ) : (
          <HttpMonitorForm monitor={monitor} />
        )}
      </div>
    </div>
  );
}
