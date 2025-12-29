import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { CreateHeartbeat, HeartbeatResponse } from "../schemas";

async function createHeartbeat({
  teamId,
  data,
}: {
  teamId: number;
  data: CreateHeartbeat;
}): Promise<HeartbeatResponse> {
  const response = await fetch(`/api/heartbeats/${teamId}`, {
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

export function useCreateHeartbeat() {
  const navigate = useNavigate();
  const router = useRouter();

  return useMutation({
    mutationFn: createHeartbeat,
    onSuccess: (data) => {
      toast.success("Heartbeat created");
      router.invalidate();
      navigate({
        to: "/$teamId/heartbeats",
        params: { teamId: String(data.teamId) },
      });
    },
    onError: (error) => {
      toast.error("Failed to create heartbeat", {
        description: error.message,
      });
    },
  });
}
