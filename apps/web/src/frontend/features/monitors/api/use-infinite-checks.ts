import { useInfiniteQuery } from "@tanstack/react-query";
import fetchChecksPaginated from "./fetch-checks-paginated";

export function useInfiniteChecks({
  teamId,
  monitorId,
  days = 14,
  result,
  location,
  dateFrom,
  dateTo,
}: {
  teamId: string;
  monitorId: string;
  days?: number;
  result?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const normalizedResult = result && result !== "" ? result : undefined;
  const normalizedLocation = location && location !== "" ? location : undefined;
  const normalizedDateFrom = dateFrom && dateFrom !== "" ? dateFrom : undefined;
  const normalizedDateTo = dateTo && dateTo !== "" ? dateTo : undefined;

  return useInfiniteQuery({
    queryKey: [
      "checks",
      teamId,
      monitorId,
      days,
      normalizedResult,
      normalizedLocation,
      normalizedDateFrom,
      normalizedDateTo,
    ],
    queryFn: ({ pageParam = 0 }) => {
      return fetchChecksPaginated({
        teamId,
        monitorId,
        limit: 50,
        offset: pageParam as number,
        days,
        result: normalizedResult,
        location: normalizedLocation,
        dateFrom: normalizedDateFrom,
        dateTo: normalizedDateTo,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) {
        return undefined;
      }
      return allPages.length * 50;
    },
    initialPageParam: 0,
    staleTime: 900_000, // 15 minutes
    placeholderData: (previousData) => previousData,
  });
}
