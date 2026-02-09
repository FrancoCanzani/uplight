import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { CreateMonitor, MonitorResponse } from "../schemas";

async function createMonitor({
  teamId,
  data,
}: {
  teamId: number;
  data: CreateMonitor;
}): Promise<MonitorResponse> {
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
  const router = useRouter();

  return useMutation({
    mutationFn: createMonitor,
    onSuccess: (data) => {
      toast.success("Monitor created", {
        description: `${data.name} is now being monitored`,
      });
      router.invalidate();
      navigate({
        to: "/$teamId/monitors",
        params: { teamId: String(data.teamId) },
      });
    },
    onError: (error) => {
      const description = error.message.toLowerCase().includes("validation")
        ? "Please check your input and try again"
        : error.message.toLowerCase().includes("network") ||
            error.message.toLowerCase().includes("fetch")
          ? "Network error. Please check your connection"
          : error.message;
      toast.error("Failed to create monitor", {
        description,
      });
    },
  });
}
