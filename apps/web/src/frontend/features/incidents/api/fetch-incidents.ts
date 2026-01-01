export type IncidentStatus =
  | "active"
  | "acknowledged"
  | "fixing"
  | "resolved"
  | "ongoing";

export interface Incident {
  id: number;
  monitorId: number;
  monitorName: string;
  cause: string;
  status: IncidentStatus;
  startedAt: number;
  acknowledgedAt: number | null;
  fixingAt: number | null;
  resolvedAt: number | null;
}

export interface IncidentsResponse {
  incidents: Incident[];
  hasMore: boolean;
  total: number;
}

export interface FetchIncidentsParams {
  teamId: string;
  limit?: number;
  offset?: number;
  monitorId?: string;
  from?: string;
  to?: string;
}

export default async function fetchIncidents({
  teamId,
  limit = 20,
  offset = 0,
  monitorId,
  from,
  to,
}: FetchIncidentsParams): Promise<IncidentsResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  if (monitorId) params.set("monitorId", monitorId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const response = await fetch(`/api/incidents/${teamId}?${params.toString()}`);

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}
