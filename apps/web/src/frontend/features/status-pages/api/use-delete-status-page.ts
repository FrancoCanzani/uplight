import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

async function deleteStatusPage({
  teamId,
  pageId,
}: {
  teamId: number;
  pageId: number;
}): Promise<void> {
  const response = await fetch(`/api/status-pages/${teamId}/${pageId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }
}

export function useDeleteStatusPage() {
  const navigate = useNavigate();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteStatusPage,
    onSuccess: (_, variables) => {
      toast.success("Status page deleted");
      router.invalidate();
      navigate({
        to: "/$teamId/status-pages",
        params: { teamId: String(variables.teamId) },
      });
    },
    onError: (error) => {
      toast.error("Failed to delete status page", {
        description: error.message,
      });
    },
  });
}
