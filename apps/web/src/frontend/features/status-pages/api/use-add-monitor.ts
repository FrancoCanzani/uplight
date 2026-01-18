import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { AddMonitor, StatusPageMonitorResponse } from "../schemas";

async function addMonitor({
  teamId,
  pageId,
  data,
}: {
  teamId: number;
  pageId: number;
  data: AddMonitor;
}): Promise<StatusPageMonitorResponse> {
  const response = await fetch(
    `/api/status-pages/${teamId}/${pageId}/monitors`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useAddMonitor() {
  const router = useRouter();

  return useMutation({
    mutationFn: addMonitor,
    onSuccess: () => {
      toast.success("Monitor added to status page");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to add monitor", {
        description: error.message,
      });
    },
  });
}
