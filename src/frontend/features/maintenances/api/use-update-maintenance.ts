import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UpdateMaintenance, Maintenance } from "../schemas";

interface UpdateMaintenanceParams {
  teamId: string;
  maintenanceId: number;
  monitorId: number;
  data: UpdateMaintenance;
}

async function updateMaintenance({
  teamId,
  maintenanceId,
  data,
}: UpdateMaintenanceParams): Promise<Maintenance> {
  const response = await fetch(`/api/maintenance/${teamId}/${maintenanceId}`, {
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

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMaintenance,
    onSuccess: (_, variables) => {
      toast.success("Maintenance updated");
      queryClient.invalidateQueries({
        queryKey: ["maintenance", variables.teamId, variables.monitorId],
      });
    },
    onError: (error) => {
      toast.error("Failed to update maintenance", {
        description: error.message,
      });
    },
  });
}
