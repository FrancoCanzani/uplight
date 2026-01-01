export type KanbanIncidentStatus = "active" | "acknowledged" | "fixing";

export interface KanbanIncident {
  id: number;
  monitorId: number;
  monitorName: string;
  status: KanbanIncidentStatus;
  cause: string;
  startedAt: number;
  acknowledgedAt: number | null;
  fixingAt: number | null;
}

export default async function fetchKanbanIncidents(
  teamId: string
): Promise<KanbanIncident[]> {
  const response = await fetch(`/api/incidents/${teamId}`);

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  const data = await response.json();

  return data.incidents;
}
