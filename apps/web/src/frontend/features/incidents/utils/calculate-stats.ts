import type { Incident } from "../types";

export interface IncidentStats {
  openCount: number;
  resolveTime: number;
  acknowledgeTime: number;
}

export function calculateIncidentStats(incidents: Incident[]): IncidentStats {
  const resolved = incidents.filter((i) => i.status === "resolved");
  const acknowledged = incidents.filter((i) => i.acknowledgedAt !== null);
  const open = incidents.filter((i) => i.status !== "resolved");

  let resolveTime = 0;
  if (resolved.length > 0) {
    const totalTime = resolved.reduce((sum, incident) => {
      if (incident.resolvedAt && incident.startedAt) {
        return sum + (incident.resolvedAt - incident.startedAt);
      }
      return sum;
    }, 0);
    resolveTime = totalTime / resolved.length;
  }

  let acknowledgeTime = 0;
  if (acknowledged.length > 0) {
    const totalTime = acknowledged.reduce((sum, incident) => {
      if (incident.acknowledgedAt && incident.startedAt) {
        return sum + (incident.acknowledgedAt - incident.startedAt);
      }
      return sum;
    }, 0);
    acknowledgeTime = totalTime / acknowledged.length;
  }

  return {
    openCount: open.length,
    resolveTime,
    acknowledgeTime,
  };
}
