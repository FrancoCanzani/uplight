import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useUpdateIncidentStatus } from "../api/use-update-incident-status";
import type { KanbanStatus } from "../types";
import DroppableIncidentColumn from "./droppable-incident-column";

const STATUSES: KanbanStatus[] = ["active", "acknowledged", "fixing"];

export default function IncidentsKanban() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/kanban");
  const { teamId } = routeApi.useParams();
  const kanbanIncidents = routeApi.useLoaderData();
  const updateStatus = useUpdateIncidentStatus();
  const [localIncidents, setLocalIncidents] = useState(kanbanIncidents);

  useEffect(() => {
    setLocalIncidents(kanbanIncidents);
  }, [kanbanIncidents]);

  function handleDrop(incidentId: number, newStatus: KanbanStatus) {
    const incident = localIncidents.find((i) => i.id === incidentId);
    if (!incident || incident.status === newStatus) return;

    const previousStatus = incident.status;

    setLocalIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, status: newStatus } : i)),
    );

    updateStatus.mutate(
      {
        teamId: Number(teamId),
        incidentId,
        status: newStatus,
      },
      {
        onError: () => {
          setLocalIncidents((prev) =>
            prev.map((i) =>
              i.id === incidentId ? { ...i, status: previousStatus } : i,
            ),
          );
        },
      },
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 flex-1">
      {STATUSES.map((status) => (
        <DroppableIncidentColumn
          key={status}
          incidents={localIncidents.filter((i) => i.status === status)}
          status={status}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
