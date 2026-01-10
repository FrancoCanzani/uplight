import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { CreateNotifier, Notifier } from "../schemas";

interface CreateNotifierParams {
  teamId: string;
  data: CreateNotifier;
}

async function createNotifier({
  teamId,
  data,
}: CreateNotifierParams): Promise<Notifier> {
  const response = await fetch(`/api/notifications/${teamId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || "Failed to create notifier");
  }

  return response.json();
}

export function useCreateNotifier() {
  const router = useRouter();

  return useMutation({
    mutationFn: createNotifier,
    onSuccess: (data) => {
      toast.success("Notifier created", {
        description: `${data.type} notifier created`,
      });
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create notifier", {
        description: error.message,
      });
    },
  });
}
