export type IncidentStatus = "ongoing" | "acknowledged" | "fixing" | "resolved";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export interface Incident {
  id: number;
  monitorId: number;
  monitorName: string;
  cause: string;
  title: string | null;
  description: string | null;
  hint: string | null;
  severity: IncidentSeverity | null;
  status: IncidentStatus;
  postMortemTitle: string | null;
  postMortemContent: string | null;
  startedAt: number;
  acknowledgedAt: number | null;
  fixingAt: number | null;
  resolvedAt: number | null;
}
