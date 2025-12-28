import { useQuery } from "@tanstack/react-query";
import type { TeamMemberResponse } from "../schemas";

export async function fetchTeamMembers(
  teamId: string
): Promise<TeamMemberResponse[]> {
  const response = await fetch(`/api/teams/${teamId}/members`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch team members");
  }

  return response.json();
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: () => fetchTeamMembers(teamId),
  });
}

