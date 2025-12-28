import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UpdateMemberRole, TeamMemberResponse } from "../schemas";

async function updateMemberRole(
  teamId: string,
  userId: string,
  data: UpdateMemberRole
): Promise<TeamMemberResponse> {
  const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update member role");
  }

  return response.json();
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      userId,
      data,
    }: {
      teamId: string;
      userId: string;
      data: UpdateMemberRole;
    }) => updateMemberRole(teamId, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["teams", variables.teamId, "members"],
      });
      toast.success("Member role updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update member role", {
        description: error.message,
      });
    },
  });
}

