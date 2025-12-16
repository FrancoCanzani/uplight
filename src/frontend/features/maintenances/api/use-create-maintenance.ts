import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateMaintenance, Maintenance } from "../schemas";

interface CreateMaintenanceParams {
  teamId: string;
  data: CreateMaintenance;
}

async function createMaintenance({
  teamId,
  data,
}: CreateMaintenanceParams): Promise<Maintenance> {
  const response = await fetch(`/api/maintenance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-team-id": teamId,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaintenance,
    onSuccess: (data) => {
      toast.success("Maintenance scheduled");
      queryClient.invalidateQueries({
        queryKey: ["maintenance", data.monitorId],
      });
    },
    onError: (error) => {
      toast.error("Failed to schedule maintenance", {
        description: error.message,
      });
    },
  });
}

