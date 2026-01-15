import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { IncidentSeverity, IncidentType } from "../types";

interface UpdateIncidentParams {
  teamId: number;
  incidentId: number;
  incidentType?: IncidentType | null;
  severity?: IncidentSeverity | null;
  assignees?: string[];
}

interface UpdateIncidentResponse {
  id: number;
  incidentType: IncidentType | null;
  severity: IncidentSeverity | null;
  assignees: string[];
  postMortemTitle: string | null;
  postMortemContent: string | null;
}

async function updateIncident({
  teamId,
  incidentId,
  incidentType,
  severity,
  assignees,
}: UpdateIncidentParams): Promise<UpdateIncidentResponse> {
  const response = await fetch(`/api/incidents/${teamId}/${incidentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ incidentType, severity, assignees }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useUpdateIncident() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIncident,
    onSuccess: () => {
      router.invalidate();
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error("Failed to update incident", {
        description: error.message,
      });
    },
  });
}
