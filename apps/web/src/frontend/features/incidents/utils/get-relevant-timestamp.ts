import type { Incident } from "../types";

export function getRelevantTimestamp(incident: Incident): number {
  switch (incident.status) {
    case "fixing":
      return incident.fixingAt ?? incident.startedAt;
    case "acknowledged":
      return incident.acknowledgedAt ?? incident.startedAt;
    default:
      return incident.startedAt;
  }
}
