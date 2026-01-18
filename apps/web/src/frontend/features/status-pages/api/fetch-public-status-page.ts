import type { PublicStatusPage } from "../types";

export default async function fetchPublicStatusPage(
  slug: string,
): Promise<PublicStatusPage> {
  const response = await fetch(`/api/public/status/${slug}`);

  if (!response.ok) {
    throw new Error("Failed to fetch status page");
  }

  return response.json();
}
