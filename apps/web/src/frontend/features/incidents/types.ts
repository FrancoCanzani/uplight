export type IncidentStatus =
  | "active"
  | "acknowledged"
  | "fixing"
  | "resolved"
  | "ongoing";

export type KanbanStatus = "active" | "acknowledged" | "fixing";

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
  startedAt: number;
  acknowledgedAt: number | null;
  fixingAt: number | null;
  resolvedAt: number | null;
}
