import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

async function removeMonitor({
  teamId,
  pageId,
  monitorId,
}: {
  teamId: number;
  pageId: number;
  monitorId: number;
}): Promise<void> {
  const response = await fetch(
    `/api/status-pages/${teamId}/${pageId}/monitors/${monitorId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }
}

export function useRemoveMonitor() {
  const router = useRouter();

  return useMutation({
    mutationFn: removeMonitor,
    onSuccess: () => {
      toast.success("Monitor removed from status page");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to remove monitor", {
        description: error.message,
      });
    },
  });
}
