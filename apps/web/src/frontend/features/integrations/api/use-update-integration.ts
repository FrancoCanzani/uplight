import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Integration, UpdateIntegration } from "../schemas";

interface UpdateIntegrationParams {
  teamId: string;
  integrationId: number;
  data: UpdateIntegration;
}

async function updateIntegration({
  teamId,
  integrationId,
  data,
}: UpdateIntegrationParams): Promise<Integration> {
  const response = await fetch(`/api/integrations/${teamId}/${integrationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || "Failed to update integration");
  }

  return response.json();
}

export function useUpdateIntegration() {
  const router = useRouter();

  return useMutation({
    mutationFn: updateIntegration,
    onSuccess: () => {
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update integration", {
        description: error.message,
      });
    },
  });
}
