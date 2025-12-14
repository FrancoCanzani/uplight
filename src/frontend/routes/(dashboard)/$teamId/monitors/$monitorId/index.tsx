import fetchMonitor from "@/features/monitors/api/fetch-monitor";
import MonitorPage from "@/features/monitors/components/monitor-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(dashboard)/$teamId/monitors/$monitorId/",
)({
  loader: ({ params }) => fetchMonitor(params.teamId, params.monitorId),

  component: MonitorPage,
});
