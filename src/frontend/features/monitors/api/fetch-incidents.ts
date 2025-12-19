export interface Incident {
  id: number;
  cause: string;
  status: string;
  startedAt: number;
  resolvedAt: number | null;
  createdAt: number;
}

export default async function fetchIncidents(
  teamId: string,
  monitorId: string,
  limit: number = 1
): Promise<Incident | null> {
  const response = await fetch(
    `/api/monitors/${teamId}/${monitorId}/incidents?limit=${limit}`
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}
