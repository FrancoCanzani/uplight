import fetchMonitor from "@/features/monitors/api/fetch-monitor";
import fetchStats from "@/features/monitors/api/fetch-stats";
import fetchChecks from "@/features/monitors/api/fetch-checks";
import fetchIncidents from "@/features/monitors/api/fetch-incidents";
import MonitorPage from "@/features/monitors/components/monitor-page";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const searchSchema = z.object({
  region: z.string().optional(),
});

export const Route = createFileRoute(
  "/(dashboard)/$teamId/monitors/$monitorId/"
)({
  validateSearch: searchSchema,
  loader: async ({ params }) => {
    const [monitor, stats, checks, incidents] = await Promise.all([
      fetchMonitor(params.teamId, params.monitorId),
      fetchStats(params.teamId, params.monitorId),
      fetchChecks(params.teamId, params.monitorId, 24),
      fetchIncidents(params.teamId, params.monitorId, 1),
    ]);

    return { monitor, stats, checks, incidents };
  },

  component: MonitorPage,
});
