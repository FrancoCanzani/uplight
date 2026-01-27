import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

interface DeleteIntegrationParams {
  teamId: string;
  integrationId: number;
}

async function deleteIntegration({
  teamId,
  integrationId,
}: DeleteIntegrationParams): Promise<void> {
  const response = await fetch(`/api/integrations/${teamId}/${integrationId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || "Failed to delete integration");
  }
}

export function useDeleteIntegration() {
  const router = useRouter();

  return useMutation({
    mutationFn: deleteIntegration,
    onSuccess: () => {
      toast.success("Integration deleted");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete integration", {
        description: error.message,
      });
    },
  });
}
