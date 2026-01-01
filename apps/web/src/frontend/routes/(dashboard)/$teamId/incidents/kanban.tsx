import fetchKanbanIncidents from "@/features/incidents/api/fetch-kanban-incidents";
import IncidentsKanbanPage from "@/features/incidents/components/incidents-kanban-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/$teamId/incidents/kanban")({
  loader: ({ params }) => fetchKanbanIncidents(params.teamId),
  component: IncidentsKanbanPage,
});
