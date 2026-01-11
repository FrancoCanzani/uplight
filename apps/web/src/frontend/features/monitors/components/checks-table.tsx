import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import type { CheckResult } from "../api/fetch-checks-paginated";
import { useInfiniteChecks } from "../api/use-infinite-checks";
import { CheckDetailSheet } from "./check-detail-sheet";
import { ChecksDataTable } from "./checks-data-table";
import { ChecksFilters } from "./checks-filters";
import { checksTableColumns } from "./checks-table-columns";

const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");

export default function ChecksTable() {
  const { teamId, monitorId } = routeApi.useParams();
  const search = routeApi.useSearch();
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteChecks({
      teamId,
      monitorId,
      days: Number(search.period || 7),
      result: search.checkResult,
      location: search.checkLocation,
      dateFrom: search.checkDateFrom,
      dateTo: search.checkDateTo,
    });

  const checks = useMemo(() => {
    return data?.pages.flatMap((page) => page.checks) ?? [];
  }, [data]);

  const handleRowClick = (check: CheckResult) => {
    navigate({
      to: "/$teamId/monitors/$monitorId",
      params: { teamId, monitorId },
      search: (prev) => ({ ...prev, checkId: String(check.id) }),
    });
  };

  return (
    <div className="space-y-8">
      <ChecksFilters isFetchingMore={isFetchingNextPage} />
      <div className="h-120">
        <ChecksDataTable
          columns={checksTableColumns}
          data={checks}
          hasMore={hasNextPage}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          onRowClick={handleRowClick}
        />
      </div>
      <CheckDetailSheet />
    </div>
  );
}
