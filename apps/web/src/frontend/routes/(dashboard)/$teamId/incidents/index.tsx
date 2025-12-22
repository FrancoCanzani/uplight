import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import fetchIncidents from "@/features/incidents/api/fetch-incidents";
import fetchMonitors from "@/features/monitors/api/fetch-monitors";
import IncidentsPage from "@/features/incidents/components/incidents-page";

const incidentsSearchSchema = z.object({
  offset: z.string().optional(),
  monitorId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const Route = createFileRoute("/(dashboard)/$teamId/incidents/")({
  validateSearch: incidentsSearchSchema,
  loaderDeps: ({ search }) => ({
    offset: search.offset,
    monitorId: search.monitorId,
    from: search.from,
    to: search.to,
  }),
  loader: async ({ params, deps }) => {
    const [incidentsData, monitors] = await Promise.all([
      fetchIncidents({
        teamId: params.teamId,
        limit: 20,
        offset: deps.offset ? Number(deps.offset) : 0,
        monitorId: deps.monitorId,
        from: deps.from,
        to: deps.to,
      }),
      fetchMonitors(params.teamId),
    ]);

    return {
      incidents: incidentsData.incidents,
      hasMore: incidentsData.hasMore,
      total: incidentsData.total,
      monitors,
    };
  },
  component: IncidentsPage,
});
