import { createFileRoute } from "@tanstack/react-router";
import fetchIncident from "@/features/incidents/api/fetch-incident";
import IncidentPage from "@/features/incidents/components/incident-page";

export const Route = createFileRoute(
  "/(dashboard)/$teamId/incidents/$incidentId",
)({
  loader: ({ params }) =>
    fetchIncident({ teamId: params.teamId, incidentId: params.incidentId }),
  component: IncidentPage,
});
