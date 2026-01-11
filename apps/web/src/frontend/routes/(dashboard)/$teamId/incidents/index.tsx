import { createFileRoute } from "@tanstack/react-router";
import fetchIncidents from "@/features/incidents/api/fetch-incidents";
import IncidentsPage from "@/features/incidents/components/incidents-page";

export const Route = createFileRoute("/(dashboard)/$teamId/incidents/")({
  loader: async ({ params }) => {
    const incidentsData = await fetchIncidents({
      teamId: params.teamId,
    });

    return {
      incidents: incidentsData.incidents,
    };
  },
  component: IncidentsPage,
});
