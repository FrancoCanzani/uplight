import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteMaintenanceParams {
  teamId: string;
  maintenanceId: number;
  monitorId: number;
}

async function deleteMaintenance({
  teamId,
  maintenanceId,
}: DeleteMaintenanceParams): Promise<void> {
  const response = await fetch(`/api/maintenance/${maintenanceId}`, {
    method: "DELETE",
    headers: {
      "x-team-id": teamId,
    },
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaintenance,
    onSuccess: (_, variables) => {
      toast.success("Maintenance deleted");
      queryClient.invalidateQueries({
        queryKey: ["maintenance", variables.monitorId],
      });
    },
    onError: (error) => {
      toast.error("Failed to delete maintenance", {
        description: error.message,
      });
    },
  });
}

