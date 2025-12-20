import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Maintenance, UpdateMaintenance } from "../schemas";

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
  const router = useRouter();

  return useMutation({
    mutationFn: updateMaintenance,
    onSuccess: () => {
      toast.success("Maintenance updated");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update maintenance", {
        description: error.message,
      });
    },
  });
}
