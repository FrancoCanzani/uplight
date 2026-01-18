import { useQuery } from "@tanstack/react-query";

async function checkSlug(
  teamId: string,
  slug: string,
): Promise<{ available: boolean }> {
  if (!slug || slug.length < 3) {
    return { available: false };
  }

  const response = await fetch(
    `/api/status-pages/${teamId}/check-slug/${slug}`,
  );

  if (!response.ok) {
    throw new Error("Failed to check slug availability");
  }

  return response.json();
}

export function useCheckSlug(teamId: string, slug: string, enabled = true) {
  return useQuery({
    queryKey: ["check-slug", teamId, slug],
    queryFn: () => checkSlug(teamId, slug),
    enabled: enabled && slug.length >= 3,
    staleTime: 0,
  });
}
