import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { UpdateTeam, TeamResponse } from "../schemas";

async function updateTeam(
  teamId: string,
  data: UpdateTeam
): Promise<TeamResponse> {
  const response = await fetch(`/api/teams/${teamId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update team");
  }

  return response.json();
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: UpdateTeam }) =>
      updateTeam(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      router.invalidate();
      toast.success("Team updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update team", {
        description: error.message,
      });
    },
  });
}

