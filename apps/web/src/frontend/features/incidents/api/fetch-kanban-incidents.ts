import type { Incident } from "../types";

export default async function fetchKanbanIncidents(
  teamId: string
): Promise<Incident[]> {
  const params = new URLSearchParams();
  params.set("status", "active,acknowledged,fixing");

  const response = await fetch(`/api/incidents/${teamId}?${params.toString()}`);

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  const data = await response.json();

  return data.incidents;
}
