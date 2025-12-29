import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { UpdateHeartbeat, HeartbeatResponse } from "../schemas";

async function updateHeartbeat({
  teamId,
  heartbeatId,
  data,
}: {
  teamId: number;
  heartbeatId: number;
  data: UpdateHeartbeat;
}): Promise<HeartbeatResponse> {
  const response = await fetch(`/api/heartbeats/${teamId}/${heartbeatId}`, {
    method: "PUT",
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

export function useUpdateHeartbeat() {
  const router = useRouter();

  return useMutation({
    mutationFn: updateHeartbeat,
    onSuccess: (data, variables) => {
      toast.success("Heartbeat updated", {
        description: `${data.name} has been updated`,
      });
      router.invalidate();
      router.navigate({
        to: "/$teamId/heartbeats/$heartbeatId",
        params: {
          teamId: String(variables.teamId),
          heartbeatId: String(variables.heartbeatId),
        },
      });
    },
    onError: (error) => {
      toast.error("Failed to update heartbeat", {
        description: error.message,
      });
    },
  });
}
