import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import fetchChecks from "@/features/monitors/api/fetch-checks";
import fetchMonitor from "@/features/monitors/api/fetch-monitor";
import LogsPage from "@/features/monitors/components/logs-page";

const searchSchema = z.object({
  date: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
  region: z.string().optional(),
  search: z.string().optional(),
  checkId: z.string().optional(),
});

export const Route = createFileRoute(
  "/(dashboard)/$teamId/monitors/$monitorId/logs",
)({
  validateSearch: searchSchema,
  loader: async ({ params }) => {
    const [monitor, checks] = await Promise.all([
      fetchMonitor(params.teamId, params.monitorId),
      fetchChecks(params.teamId, params.monitorId, 14),
    ]);
    return { monitor, checks };
  },
  component: LogsPage,
});
