import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { CreateTeam, TeamResponse } from "../schemas";

async function createTeam(data: CreateTeam): Promise<TeamResponse> {
  const response = await fetch("/api/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useCreateTeam() {
  const router = useRouter();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: (data) => {
      toast.success("Team created", {
        description: `${data.name} is ready to use`,
      });
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create team", {
        description: error.message,
      });
    },
  });
}
