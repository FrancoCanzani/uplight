import fetchChecks from "@/features/monitors/api/fetch-checks";
import fetchIncidents from "@/features/monitors/api/fetch-incidents";
import fetchMonitor from "@/features/monitors/api/fetch-monitor";
import fetchStats from "@/features/monitors/api/fetch-stats";
import MonitorPage from "@/features/monitors/components/monitor-page";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const searchSchema = z.object({
  region: z.string().optional(),
  period: z.string().optional().default("7"),
});

export const Route = createFileRoute(
  "/(dashboard)/$teamId/monitors/$monitorId/"
)({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    period: search.period,
    region: search.region,
  }),
  loader: async ({ params, deps }) => {
    const days = Number(deps.period || 7);
    const [monitor, stats, checks, incidents] = await Promise.all([
      fetchMonitor(params.teamId, params.monitorId),
      fetchStats(params.teamId, params.monitorId, days),
      fetchChecks(params.teamId, params.monitorId, days),
      fetchIncidents(params.teamId, params.monitorId, 1),
    ]);

    return { monitor, stats, checks, incidents };
  },
  // 15 minutes
  staleTime: 900_000,
  component: MonitorPage,
});
