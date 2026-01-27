import type { Integration } from "../schemas";

export default async function fetchIntegrations(
  teamId: string,
): Promise<Integration[]> {
  const response = await fetch(`/api/integrations/${teamId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch integrations");
  }

  return response.json();
}
