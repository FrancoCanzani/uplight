import type { MonitorResponse } from "../schemas";

export default async function fetchMonitor(
  teamId: string,
  monitorId: string
): Promise<MonitorResponse> {
  const response = await fetch(`/api/monitors/${teamId}/${monitorId}`);

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}
