import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export default function useUpdateIncidentPostMortem() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      teamId,
      incidentId,
      postMortemTitle,
      postMortemContent,
    }: {
      teamId: string;
      incidentId: string;
      postMortemTitle: string | null;
      postMortemContent: string | null;
    }) => {
      const response = await fetch(`/api/incidents/${teamId}/${incidentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postMortemTitle, postMortemContent }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to update post mortem");
      }

      return response.json();
    },
    onSuccess: () => {
      router.invalidate();
    },
  });
}
