import type { StatusPageResponse } from "../schemas";

export default async function fetchStatusPages(
  teamId: string,
): Promise<StatusPageResponse[]> {
  const response = await fetch(`/api/status-pages/${teamId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch status pages");
  }

  return response.json();
}
