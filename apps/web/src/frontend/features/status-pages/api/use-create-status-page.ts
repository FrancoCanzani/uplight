import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { CreateStatusPage, StatusPageResponse } from "../schemas";

async function createStatusPage({
  teamId,
  data,
}: {
  teamId: number;
  data: CreateStatusPage;
}): Promise<StatusPageResponse> {
  const response = await fetch(`/api/status-pages/${teamId}`, {
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

export function useCreateStatusPage() {
  const navigate = useNavigate();
  const router = useRouter();

  return useMutation({
    mutationFn: createStatusPage,
    onSuccess: (data) => {
      toast.success("Status page created", {
        description: `${data.name} has been created`,
      });
      router.invalidate();
      navigate({
        to: "/$teamId/status-pages/$pageId",
        params: { teamId: String(data.teamId), pageId: String(data.id) },
      });
    },
    onError: (error) => {
      toast.error("Failed to create status page", {
        description: error.message,
      });
    },
  });
}
