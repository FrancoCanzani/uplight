import type { KanbanIncident } from "../api/fetch-kanban-incidents";

export function getRelevantTimestamp(incident: KanbanIncident): number {
  switch (incident.status) {
    case "fixing":
      return incident.fixingAt ?? incident.startedAt;
    case "acknowledged":
      return incident.acknowledgedAt ?? incident.startedAt;
    default:
      return incident.startedAt;
  }
}
