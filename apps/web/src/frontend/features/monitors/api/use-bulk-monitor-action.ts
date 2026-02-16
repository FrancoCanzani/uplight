import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

type BulkAction = "pause" | "resume" | "delete";

interface BulkMonitorActionParams {
  teamId: string;
  action: BulkAction;
  monitorIds: number[];
}

async function bulkMonitorAction({
  teamId,
  action,
  monitorIds,
}: BulkMonitorActionParams): Promise<{ affected: number }> {
  const response = await fetch(`/api/monitors/${teamId}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, monitorIds }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

const ACTION_LABELS: Record<BulkAction, { past: string; verb: string }> = {
  pause: { past: "paused", verb: "pause" },
  resume: { past: "resumed", verb: "resume" },
  delete: { past: "deleted", verb: "delete" },
};

export function useBulkMonitorAction() {
  const router = useRouter();

  return useMutation({
    mutationFn: bulkMonitorAction,
    onSuccess: (data, variables) => {
      const label = ACTION_LABELS[variables.action];
      toast.success(`${data.affected} monitor${data.affected !== 1 ? "s" : ""} ${label.past}`);
      router.invalidate();
    },
    onError: (error, variables) => {
      const label = ACTION_LABELS[variables.action];
      toast.error(`Failed to ${label.verb} monitors`, {
        description: error.message,
      });
    },
  });
}
