import type { Notifier } from "../schemas";

export default async function fetchNotifiers(
  teamId: string,
): Promise<Notifier[]> {
  const response = await fetch(`/api/notifications/${teamId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch notifiers");
  }

  return response.json();
}
