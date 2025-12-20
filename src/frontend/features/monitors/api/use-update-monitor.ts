import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { MonitorResponse, UpdateMonitor } from "../schemas";

interface UpdateMonitorParams {
  teamId: number;
  monitorId: number;
  data: UpdateMonitor;
}

async function updateMonitor({
  teamId,
  monitorId,
  data,
}: UpdateMonitorParams): Promise<MonitorResponse> {
  const response = await fetch(`/api/monitors/${teamId}/${monitorId}`, {
    method: "PUT",
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

export function useUpdateMonitor() {
  const navigate = useNavigate();
  const router = useRouter();

  return useMutation({
    mutationFn: updateMonitor,
    onSuccess: (data) => {
      toast.success("Monitor updated", {
        description: `${data.name} has been updated`,
      });
      router.invalidate();
      navigate({
        to: "/$teamId/monitors/$monitorId",
        params: { teamId: String(data.teamId), monitorId: String(data.id) },
      });
    },
    onError: (error) => {
      toast.error("Failed to update monitor", {
        description: error.message,
      });
    },
  });
}
