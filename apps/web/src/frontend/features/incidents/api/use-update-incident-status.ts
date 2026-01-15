import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

type UpdateableStatus =
  | "ongoing"
  | "acknowledged"
  | "fixing"
  | "recovered"
  | "resolved";

interface UpdateIncidentStatusResponse {
  id: number;
  status: string;
  acknowledgedAt: number | null;
  fixingAt: number | null;
  recoveredAt: number | null;
  resolvedAt: number | null;
}

async function updateIncidentStatus({
  teamId,
  incidentId,
  status,
}: {
  teamId: number;
  incidentId: number;
  status: UpdateableStatus;
}): Promise<UpdateIncidentStatusResponse> {
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIncidentStatus,
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
