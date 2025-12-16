import type { Maintenance } from "../schemas";

export default async function fetchMaintenance(
  teamId: string,
  monitorId: string
): Promise<Maintenance[]> {
  const response = await fetch(`/api/maintenance/${monitorId}`, {
    headers: {
      "x-team-id": teamId,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch maintenance windows");
  }

  return response.json();
}

