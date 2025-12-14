import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { CreateMonitor, MonitorResponse } from "../schemas";

interface CreateMonitorParams {
  teamId: number;
  data: CreateMonitor;
}

async function createMonitor({
  teamId,
  data,
}: CreateMonitorParams): Promise<MonitorResponse> {
  const response = await fetch(`/api/monitors/${teamId}`, {
    method: "POST",
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

export function useCreateMonitor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMonitor,
    onSuccess: (data) => {
      toast.success("Monitor created", {
        description: `${data.name} is now being monitored`,
      });
      queryClient.invalidateQueries({ queryKey: ["monitors", data.teamId] });
      navigate({ to: "/$teamId", params: { teamId: String(data.teamId) } });
    },
    onError: (error) => {
      toast.error("Failed to create monitor", {
        description: error.message,
      });
    },
  });
}
