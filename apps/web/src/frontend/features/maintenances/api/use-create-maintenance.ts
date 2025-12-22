import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
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
  const response = await fetch(`/api/maintenance/${teamId}`, {
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

export function useCreateMaintenance() {
  const router = useRouter();

  return useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      toast.success("Maintenance scheduled");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to schedule maintenance", {
        description: error.message,
      });
    },
  });
}
