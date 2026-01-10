import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Notifier, UpdateNotifier } from "../schemas";

interface UpdateNotifierParams {
  teamId: string;
  notifierId: number;
  data: UpdateNotifier;
}

async function updateNotifier({
  teamId,
  notifierId,
  data,
}: UpdateNotifierParams): Promise<Notifier> {
  const response = await fetch(`/api/notifications/${teamId}/${notifierId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || "Failed to update notifier");
  }

  return response.json();
}

export function useUpdateNotifier() {
  const router = useRouter();

  return useMutation({
    mutationFn: updateNotifier,
    onSuccess: () => {
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update notifier", {
        description: error.message,
      });
    },
  });
}
