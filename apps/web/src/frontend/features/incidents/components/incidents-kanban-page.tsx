import { getRouteApi, Link } from "@tanstack/react-router";
import IncidentsKanban from "./incidents-kanban";

export default function IncidentsKanbanPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/kanban");
  const { teamId } = routeApi.useParams();

  return (
    <div className="space-y-12 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl tracking-tight text-balance">
          Active Incidents
        </h1>
        <Link
          to="/$teamId/incidents"
          params={{ teamId }}
          className="text-muted-foreground text-sm hover:underline"
        >
          View all
        </Link>
      </div>
      <IncidentsKanban />
    </div>
  );
}
