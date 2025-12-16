import type { MonitorResponse } from "../schemas";

export default async function fetchMonitors(
  teamId: string,
): Promise<MonitorResponse[]> {
  const response = await fetch(`/api/monitors/${teamId}`);

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}
