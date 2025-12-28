import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function removeMember(teamId: string, userId: string): Promise<void> {
  const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to remove member");
  }
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeMember(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["teams", variables.teamId, "members"],
      });
      toast.success("Member removed");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove member", {
        description: error.message,
      });
    },
  });
}

