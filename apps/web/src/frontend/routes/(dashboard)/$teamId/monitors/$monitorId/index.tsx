import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import fetchChecks from "@/features/monitors/api/fetch-checks";
import fetchFindings from "@/features/monitors/api/fetch-findings";
import fetchIncidents from "@/features/monitors/api/fetch-incidents";
import fetchMonitor from "@/features/monitors/api/fetch-monitor";
import fetchStats from "@/features/monitors/api/fetch-stats";
import MonitorPage from "@/features/monitors/components/monitor-page";

const searchSchema = z.object({
  region: z.string().optional(),
  period: z.string().optional(),
  checkId: z.string().optional(),
  checkResult: z.string().optional(),
  checkLocation: z.string().optional(),
  checkDateFrom: z.string().optional(),
  checkDateTo: z.string().optional(),
});

export const Route = createFileRoute(
  "/(dashboard)/$teamId/monitors/$monitorId/",
)({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    period: search.period,
    region: search.region,
  }),
  loader: async ({ params, deps }) => {
    const days = Number(deps.period || 7);
    const [monitor, stats, checks, incidents, findings] = await Promise.all([
      fetchMonitor(params.teamId, params.monitorId),
      fetchStats(params.teamId, params.monitorId, days),
      fetchChecks(params.teamId, params.monitorId, days),
      fetchIncidents(params.teamId, params.monitorId, 10),
      fetchFindings(params.teamId, params.monitorId, 30),
    ]);

    return { monitor, stats, checks, incidents, findings };
  },
  // 15 minutes
  staleTime: 900_000,
  component: MonitorPage,
});
