import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { StatusPageResponse, UpdateStatusPage } from "../schemas";

async function updateStatusPage({
  teamId,
  pageId,
  data,
}: {
  teamId: number;
  pageId: number;
  data: UpdateStatusPage;
}): Promise<StatusPageResponse> {
  const response = await fetch(`/api/status-pages/${teamId}/${pageId}`, {
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

export function useUpdateStatusPage() {
  const router = useRouter();

  return useMutation({
    mutationFn: updateStatusPage,
    onSuccess: () => {
      toast.success("Status page updated");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update status page", {
        description: error.message,
      });
    },
  });
}
