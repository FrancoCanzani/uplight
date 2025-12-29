import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { HeartbeatResponse } from "../schemas";

async function toggleHeartbeatStatus({
  teamId,
  heartbeatId,
  status,
}: {
  teamId: number;
  heartbeatId: number;
  status: "paused" | "initializing";
  name: string;
}): Promise<HeartbeatResponse> {
  const response = await fetch(
    `/api/heartbeats/${teamId}/${heartbeatId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useToggleHeartbeatStatus() {
  const router = useRouter();

  return useMutation({
    mutationFn: toggleHeartbeatStatus,
    onSuccess: (_data, variables) => {
      const action = variables.status === "paused" ? "paused" : "resumed";
      toast.success(`Heartbeat ${action}`, {
        description: `${variables.name} has been ${action}`,
      });
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update heartbeat status", {
        description: error.message,
      });
    },
  });
}
