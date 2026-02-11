import { useMemo } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { startOfDay, subDays } from "date-fns";
import { PageHeader } from "@/components/page-header";
import type { CheckResult } from "../api/fetch-checks";
import { CheckDetailSheet } from "./check-detail-sheet";
import { LogsFilters } from "./logs-filters";
import LogsTable from "./logs-table";

const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/logs");

export default function LogsPage() {
  const { monitor, checks } = routeApi.useLoaderData();
  const { teamId, monitorId } = routeApi.useParams();
  const search = routeApi.useSearch();
  const navigate = useNavigate();

  const filters = useMemo(
    () => ({
      date: search.date || "all",
      dateFrom: search.dateFrom || "",
      dateTo: search.dateTo || "",
      status: search.status || "all",
      region: search.region || "all",
      search: search.search || "",
    }),
    [
      search.date,
      search.dateFrom,
      search.dateTo,
      search.status,
      search.region,
      search.search,
    ],
  );

  const filteredChecks = useMemo(() => {
    return filterChecks(checks, filters);
  }, [checks, filters]);

  const handleRowClick = (check: CheckResult) => {
    navigate({
      to: "/$teamId/monitors/$monitorId/logs",
      params: { teamId, monitorId },
      search: (prev) => ({ ...prev, checkId: String(check.id) }),
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-6 space-y-6">
      <PageHeader title={`${monitor.name}`} />

      <LogsFilters
        checks={checks}
        teamId={teamId}
        monitorId={monitorId}
        filters={filters}
      />

      <div className="text-xs text-muted-foreground font-mono">
        Showing {filteredChecks.length} of {checks.length} checks * Click any
        row for more information
      </div>

      <div className="max-h-[calc(100vh-250px)] overflow-auto">
        <LogsTable
          checks={filteredChecks}
          monitor={monitor}
          onRowClick={handleRowClick}
        />
      </div>

      <CheckDetailSheet />
    </div>
  );
}

function filterChecks(
  checks: CheckResult[],
  filters: {
    date: string;
    dateFrom: string;
    dateTo: string;
    status: string;
    region: string;
    search: string;
  },
): CheckResult[] {
  return checks.filter((check) => {
    if (filters.dateFrom) {
      const min = Number(filters.dateFrom);
      if (!Number.isNaN(min) && check.checkedAt < min) return false;
    }

    if (filters.dateTo) {
      const max = Number(filters.dateTo);
      if (!Number.isNaN(max) && check.checkedAt > max) return false;
    }

    if (filters.date === "today") {
      const today = startOfDay(new Date()).getTime();
      if (check.checkedAt < today) return false;
    } else if (filters.date === "yesterday") {
      const yesterday = startOfDay(subDays(new Date(), 1)).getTime();
      const today = startOfDay(new Date()).getTime();
      if (check.checkedAt < yesterday || check.checkedAt >= today) return false;
    } else if (filters.date === "last7days") {
      const last7days = startOfDay(subDays(new Date(), 7)).getTime();
      if (check.checkedAt < last7days) return false;
    }

    if (filters.status !== "all") {
      if (filters.status === "issues") {
        const isIssue =
          check.result !== "success" &&
          check.result !== "degraded" &&
          check.result !== "maintenance";
        if (!isIssue) return false;
      } else if (check.result !== filters.status) {
        return false;
      }
    }

    if (filters.region !== "all" && check.location !== filters.region) {
      return false;
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchesLocation = check.location.toLowerCase().includes(query);
      const matchesCode = check.statusCode?.toString().includes(query);
      const matchesError = check.errorMessage?.toLowerCase().includes(query);
      if (!matchesLocation && !matchesCode && !matchesError) {
        return false;
      }
    }

    return true;
  });
}
