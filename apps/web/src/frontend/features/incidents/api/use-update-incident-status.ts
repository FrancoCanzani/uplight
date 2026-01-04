import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { KanbanStatus } from "../types";

interface UpdateIncidentStatusParams {
  teamId: number;
  incidentId: number;
  status: KanbanStatus;
}

interface UpdateIncidentStatusResponse {
  id: number;
  status: string;
  acknowledgedAt: number | null;
  fixingAt: number | null;
}

async function updateIncidentStatus({
  teamId,
  incidentId,
  status,
}: UpdateIncidentStatusParams): Promise<UpdateIncidentStatusResponse> {
  const response = await fetch(`/api/incidents/${teamId}/${incidentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useUpdateIncidentStatus() {
  const router = useRouter();

  return useMutation({
    mutationFn: updateIncidentStatus,
    onSuccess: () => {
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update incident", {
        description: error.message,
      });
    },
  });
}
