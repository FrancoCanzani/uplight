import { createFileRoute, getRouteApi } from "@tanstack/react-router";
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

const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/edit");

function EditMonitorPage() {
  const { monitor } = Route.useLoaderData();
  const { teamId, monitorId } = routeApi.useParams();

  return (
    <div className="space-y-8 w-full lg:max-w-4xl mx-auto">
      <PageHeader
        title="Edit Monitor"
        subtitle={monitor.name}
        backLink={{
          to: "/$teamId/monitors/$monitorId",
          params: { teamId, monitorId },
        }}
      />
      {monitor.type === "tcp" ? (
        <TcpMonitorForm monitor={monitor} />
      ) : (
        <HttpMonitorForm monitor={monitor} />
      )}
    </div>
  );
}
