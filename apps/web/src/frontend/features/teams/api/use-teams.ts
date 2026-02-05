import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/client";
import type { TeamResponse } from "../schemas";

export async function fetchTeams(): Promise<TeamResponse[]> {
  const response = await fetch("/api/teams");

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useTeams() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    enabled: !!session?.user,
  });
}
