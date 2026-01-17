export type IncidentStatus =
  | "ongoing"
  | "acknowledged"
  | "fixing"
  | "recovered"
  | "resolved";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export type IncidentType =
  | "availability"
  | "performance"
  | "security"
  | "data"
  | "other";

export type IncidentActivityType =
  | "status_change"
  | "assignee_added"
  | "assignee_removed"
  | "comment"
  | "type_changed"
  | "severity_changed";

export type IncidentSourceType = "monitor" | "heartbeat";

export interface Incident {
  id: number;
  monitorId: number;
  monitorName: string;
  cause: string;
  title: string | null;
  description: string | null;
  hint: string | null;
  severity: IncidentSeverity | null;
  incidentType: IncidentType | null;
  status: IncidentStatus;
  assignees?: string[];
  postMortemTitle: string | null;
  postMortemContent: string | null;
  startedAt: number;
  acknowledgedAt: number | null;
  fixingAt: number | null;
  recoveredAt: number | null;
  resolvedAt: number | null;
  type: IncidentSourceType;
}

export interface IncidentActivity {
  id: number;
  incidentId: number;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
  type: IncidentActivityType;
  content: string | null;
  metadata: string | null;
  createdAt: number;
}
