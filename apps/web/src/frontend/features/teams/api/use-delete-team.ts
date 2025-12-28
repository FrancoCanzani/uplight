import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

async function deleteTeam(teamId: string): Promise<void> {
  const response = await fetch(`/api/teams/${teamId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete team");
  }
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      router.navigate({ to: "/" });
      toast.success("Team deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete team", {
        description: error.message,
      });
    },
  });
}

