import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { CreateGroup, GroupResponse } from "../schemas";

async function createGroup({
  teamId,
  pageId,
  data,
}: {
  teamId: number;
  pageId: number;
  data: CreateGroup;
}): Promise<GroupResponse> {
  const response = await fetch(
    `/api/status-pages/${teamId}/${pageId}/groups`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useCreateGroup() {
  const router = useRouter();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      toast.success("Group created");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create group", {
        description: error.message,
      });
    },
  });
}
