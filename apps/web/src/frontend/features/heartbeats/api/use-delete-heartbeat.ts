import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

async function deleteHeartbeat({
  teamId,
  heartbeatId,
}: {
  teamId: number;
  heartbeatId: number;
  name: string;
}): Promise<void> {
  const response = await fetch(`/api/heartbeats/${teamId}/${heartbeatId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }
}

export function useDeleteHeartbeat() {
  const navigate = useNavigate();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteHeartbeat,
    onSuccess: (_, variables) => {
      toast.success("Heartbeat deleted", {
        description: `${variables.name} has been deleted`,
      });
      router.invalidate();
      navigate({
        to: "/$teamId/heartbeats",
        params: { teamId: String(variables.teamId) },
      });
    },
    onError: (error) => {
      toast.error("Failed to delete heartbeat", {
        description: error.message,
      });
    },
  });
}
