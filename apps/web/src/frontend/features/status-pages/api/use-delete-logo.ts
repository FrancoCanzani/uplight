import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

async function deleteLogo({
  teamId,
  pageId,
}: {
  teamId: number;
  pageId: number;
}): Promise<void> {
  const response = await fetch(`/api/status-pages/${teamId}/${pageId}/logo`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }
}

export function useDeleteLogo() {
  const router = useRouter();

  return useMutation({
    mutationFn: deleteLogo,
    onSuccess: () => {
      toast.success("Logo deleted");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete logo", {
        description: error.message,
      });
    },
  });
}
