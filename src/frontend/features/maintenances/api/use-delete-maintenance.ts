import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
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
  const response = await fetch(`/api/maintenance/${teamId}/${maintenanceId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }
}

export function useDeleteMaintenance() {
  const router = useRouter();

  return useMutation({
    mutationFn: deleteMaintenance,
    onSuccess: () => {
      toast.success("Maintenance deleted");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete maintenance", {
        description: error.message,
      });
    },
  });
}
