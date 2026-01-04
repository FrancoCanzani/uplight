import type { Incident } from "../types";

export default async function fetchIncident({
  teamId,
  incidentId,
}: {
  teamId: string;
  incidentId: string;
}): Promise<Incident> {
  const response = await fetch(`/api/incidents/${teamId}/${incidentId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch incident");
  }

  return response.json();
}
