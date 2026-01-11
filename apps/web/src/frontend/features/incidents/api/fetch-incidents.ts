import type { Incident } from "../types";

export interface IncidentsResponse {
  incidents: Incident[];
  hasMore: boolean;
  total: number;
}

export interface FetchIncidentsParams {
  teamId: string;
}

export default async function fetchIncidents({
  teamId,
}: FetchIncidentsParams): Promise<IncidentsResponse> {
  const params = new URLSearchParams();
  params.set("limit", "10000");

  const response = await fetch(`/api/incidents/${teamId}?${params.toString()}`);

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}
