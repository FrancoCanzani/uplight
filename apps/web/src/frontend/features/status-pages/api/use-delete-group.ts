import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

async function deleteGroup({
  teamId,
  pageId,
  groupId,
}: {
  teamId: number;
  pageId: number;
  groupId: number;
}): Promise<void> {
  const response = await fetch(
    `/api/status-pages/${teamId}/${pageId}/groups/${groupId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }
}

export function useDeleteGroup() {
  const router = useRouter();

  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      toast.success("Group deleted");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete group", {
        description: error.message,
      });
    },
  });
}
