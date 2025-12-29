import type { HeartbeatResponse } from "../schemas";

export async function fetchHeartbeat(
  teamId: number,
  heartbeatId: number
): Promise<HeartbeatResponse> {
  const response = await fetch(`/api/heartbeats/${teamId}/${heartbeatId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch heartbeat");
  }

  return response.json();
}
