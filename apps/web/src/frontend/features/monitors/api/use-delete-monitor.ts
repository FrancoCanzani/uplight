import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

interface DeleteMonitorParams {
  teamId: string;
  monitorId: string;
}

async function deleteMonitor({
  teamId,
  monitorId,
}: DeleteMonitorParams): Promise<void> {
  const response = await fetch(`/api/monitors/${teamId}/${monitorId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }
}

export function useDeleteMonitor() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteMonitor,
    onSuccess: (_, variables) => {
      toast.success("Monitor deleted");
      navigate({
        to: "/$teamId/monitors",
        params: { teamId: variables.teamId },
      });
    },
    onError: (error) => {
      toast.error("Failed to delete monitor", {
        description: error.message,
      });
    },
  });
}
