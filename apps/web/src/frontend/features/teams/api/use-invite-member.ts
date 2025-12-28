import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { InviteMember, TeamMemberResponse } from "../schemas";

async function inviteMember(
  teamId: string,
  data: InviteMember
): Promise<TeamMemberResponse> {
  const response = await fetch(`/api/teams/${teamId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to invite member");
  }

  return response.json();
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: InviteMember }) =>
      inviteMember(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["teams", variables.teamId, "members"],
      });
      toast.success("Member added", {
        description: `${variables.data.email} has been added to the team`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to add member", {
        description: error.message,
      });
    },
  });
}

