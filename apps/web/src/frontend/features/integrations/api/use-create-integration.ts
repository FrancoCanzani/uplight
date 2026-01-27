import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { CreateIntegration, Integration } from "../schemas";

interface CreateIntegrationParams {
  teamId: string;
  data: CreateIntegration;
}

async function createIntegration({
  teamId,
  data,
}: CreateIntegrationParams): Promise<Integration> {
  const response = await fetch(`/api/integrations/${teamId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || "Failed to create integration");
  }

  return response.json();
}

export function useCreateIntegration() {
  const router = useRouter();

  return useMutation({
    mutationFn: createIntegration,
    onSuccess: (data) => {
      toast.success("Integration created", {
        description: `${data.type} integration created`,
      });
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create integration", {
        description: error.message,
      });
    },
  });
}
