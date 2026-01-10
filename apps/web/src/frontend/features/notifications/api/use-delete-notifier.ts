import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

interface DeleteNotifierParams {
  teamId: string;
  notifierId: number;
}

async function deleteNotifier({
  teamId,
  notifierId,
}: DeleteNotifierParams): Promise<void> {
  const response = await fetch(`/api/notifications/${teamId}/${notifierId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || "Failed to delete notifier");
  }
}

export function useDeleteNotifier() {
  const router = useRouter();

  return useMutation({
    mutationFn: deleteNotifier,
    onSuccess: () => {
      toast.success("Notifier deleted");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete notifier", {
        description: error.message,
      });
    },
  });
}
