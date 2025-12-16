import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ToggleStatusParams {
  teamId: string;
  monitorId: string;
  status: "paused" | "initializing";
}

async function toggleMonitorStatus({
  teamId,
  monitorId,
  status,
}: ToggleStatusParams): Promise<{ id: number; status: string }> {
  const response = await fetch(`/api/monitors/${teamId}/${monitorId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useToggleMonitorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleMonitorStatus,
    onSuccess: (data, variables) => {
      const action = data.status === "paused" ? "paused" : "resumed";
      toast.success(`Monitor ${action}`);
      queryClient.invalidateQueries({
        queryKey: ["monitor", variables.teamId, variables.monitorId],
      });
      queryClient.invalidateQueries({
        queryKey: ["monitors", variables.teamId],
      });
    },
    onError: (error) => {
      toast.error("Failed to update monitor", {
        description: error.message,
      });
    },
  });
}

