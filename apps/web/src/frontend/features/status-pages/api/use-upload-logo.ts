import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

async function uploadLogo({
  teamId,
  pageId,
  file,
}: {
  teamId: number;
  pageId: number;
  file: File;
}): Promise<{ logoKey: string }> {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await fetch(`/api/status-pages/${teamId}/${pageId}/logo`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}

export function useUploadLogo() {
  const router = useRouter();

  return useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      toast.success("Logo uploaded");
      router.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to upload logo", {
        description: error.message,
      });
    },
  });
}
