import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { IncidentActivity } from "../types";

interface FetchIncidentActivitiesResponse {
  activities: IncidentActivity[];
}

async function fetchIncidentActivities({
  teamId,
  incidentId,
}: {
  teamId: number;
  incidentId: number;
}): Promise<FetchIncidentActivitiesResponse> {
  const response = await fetch(
    `/api/incidents/${teamId}/${incidentId}/activities`
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useFetchIncidentActivities({
  teamId,
  incidentId,
}: {
  teamId: number;
  incidentId: number;
}) {
  return useQuery({
    queryKey: ["incident-activities", teamId, incidentId],
    queryFn: () => fetchIncidentActivities({ teamId, incidentId }),
  });
}

async function addIncidentComment({
  teamId,
  incidentId,
  content,
}: {
  teamId: number;
  incidentId: number;
  content: string;
}): Promise<IncidentActivity> {
  const response = await fetch(
    `/api/incidents/${teamId}/${incidentId}/activities`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useAddIncidentComment() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addIncidentComment,
    onSuccess: () => {
      router.invalidate();
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error("Failed to add comment", {
        description: error.message,
      });
    },
  });
}
