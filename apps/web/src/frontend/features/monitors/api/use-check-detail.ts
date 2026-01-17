import { useQuery } from "@tanstack/react-query";
import { fetchCheckDetail } from "./fetch-check-detail";

export function useCheckDetail(
  teamId: string,
  monitorId: string,
  checkId: string | undefined,
) {
  return useQuery({
    queryKey: ["check-detail", teamId, monitorId, checkId],
    queryFn: () => {
      if (!checkId) {
        throw new Error("Check ID is required");
      }
      return fetchCheckDetail(teamId, monitorId, checkId);
    },
    enabled: !!checkId,
    staleTime: 900_000, // 15 minutes
  });
}
