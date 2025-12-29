import type { HeartbeatResponse } from "../schemas";

export async function fetchHeartbeats(
  teamId: number
): Promise<HeartbeatResponse[]> {
  const response = await fetch(`/api/heartbeats/${teamId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch heartbeats");
  }

  return response.json();
}
