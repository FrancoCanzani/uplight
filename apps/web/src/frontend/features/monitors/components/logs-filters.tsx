import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CheckResult } from "../api/fetch-checks";
import { LOCATIONS } from "../constants";

export function LogsFilters({
  checks,
  teamId,
  monitorId,
  filters,
}: {
  checks: CheckResult[];
  teamId: string;
  monitorId: string;
  filters: {
    date: string;
    dateFrom: string;
    dateTo: string;
    status: string;
    region: string;
    search: string;
  };
}) {
  const navigate = useNavigate();

  const regions = useMemo(() => {
    const uniqueRegions = new Set(checks.map((c) => c.location));
    return Array.from(uniqueRegions)
      .map((id) => {
        const location = LOCATIONS.find((l) => l.id === id);
        return {
          id,
          label: location?.label || id.toUpperCase(),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [checks]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set(checks.map((c) => c.result));
    const hasIssues = checks.some(
      (c) =>
        c.result !== "success" &&
        c.result !== "degraded" &&
        c.result !== "maintenance",
    );
    return {
      success: statuses.has("success"),
      failure: statuses.has("failure"),
      timeout: statuses.has("timeout"),
      issues: hasIssues,
    };
  }, [checks]);

  const hasActiveFilters =
    filters.date !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.status !== "all" ||
    filters.region !== "all" ||
    filters.search !== "";

  const showRegionFilter = regions.length > 1;
  const hasDateWindow = filters.dateFrom !== "" || filters.dateTo !== "";

  const dateWindowLabel = useMemo(() => {
    if (!hasDateWindow) return null;

    const min = Number(filters.dateFrom);
    const max = Number(filters.dateTo);

    if (Number.isNaN(min) && Number.isNaN(max)) return "Custom time window";
    if (Number.isNaN(min) && !Number.isNaN(max)) {
      return `Until ${format(new Date(max), "MMM d, HH:mm")}`;
    }
    if (!Number.isNaN(min) && Number.isNaN(max)) {
      return `From ${format(new Date(min), "MMM d, HH:mm")}`;
    }

    return `${format(new Date(min), "MMM d, HH:mm")} - ${format(new Date(max), "HH:mm")}`;
  }, [filters.dateFrom, filters.dateTo, hasDateWindow]);

  const updateFilter = (key: string, value: string | null) => {
    navigate({
      to: "/$teamId/monitors/$monitorId/logs",
      params: { teamId, monitorId },
      search: (prev) => ({
        ...prev,
        [key]: value === "all" || !value ? undefined : value,
      }),
    });
  };

  const updateSearch = (value: string) => {
    navigate({
      to: "/$teamId/monitors/$monitorId/logs",
      params: { teamId, monitorId },
      search: (prev) => ({
        ...prev,
        search: value || undefined,
      }),
    });
  };

  const clearFilters = () => {
    navigate({
      to: "/$teamId/monitors/$monitorId/logs",
      params: { teamId, monitorId },
      search: {},
    });
  };

  const clearDateWindow = () => {
    navigate({
      to: "/$teamId/monitors/$monitorId/logs",
      params: { teamId, monitorId },
      search: (prev) => ({
        ...prev,
        dateFrom: undefined,
        dateTo: undefined,
      }),
    });
  };

  const dateLabel =
    {
      all: "Last 14 Days",
      today: "Today",
      yesterday: "Yesterday",
      last7days: "Last 7 Days",
    }[filters.date] || "Last 14 Days";

  const statusLabel =
    {
      all: "All Status",
      issues: "All Issues",
      success: "Success",
      failure: "Failure",
      timeout: "Timeout",
    }[filters.status] || "All Status";

  const regionLabel =
    filters.region === "all"
      ? "All Regions"
      : regions.find((r) => r.id === filters.region)?.label || "All Regions";

  return (
    <div className="flex gap-3 flex-wrap items-center">
      <Select
        value={filters.date}
        onValueChange={(value: string | null) => updateFilter("date", value)}
      >
        <SelectTrigger className="w-auto">
          <SelectValue>{dateLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Last 14 Days</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last7days">Last 7 Days</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value: string | null) => updateFilter("status", value)}
      >
        <SelectTrigger className="w-auto">
          <SelectValue>{statusLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {availableStatuses.issues && (
            <SelectItem value="issues">All Issues</SelectItem>
          )}
          {availableStatuses.success && (
            <SelectItem value="success">Success</SelectItem>
          )}
          {availableStatuses.failure && (
            <SelectItem value="failure">Failure</SelectItem>
          )}
          {availableStatuses.timeout && (
            <SelectItem value="timeout">Timeout</SelectItem>
          )}
        </SelectContent>
      </Select>

      {showRegionFilter && (
        <Select
          value={filters.region}
          onValueChange={(value: string | null) =>
            updateFilter("region", value)
          }
        >
          <SelectTrigger className="w-auto">
            <SelectValue>{regionLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {dateWindowLabel && (
        <Button variant="outline" size="xs" onClick={clearDateWindow}>
          <span className="text-muted-foreground">Window:</span>
          <span className="font-mono">{dateWindowLabel}</span>
        </Button>
      )}

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters}>
          <FilterX className="size-3.5" />
          Clear
        </Button>
      )}

      <div className="flex-1 flex justify-end">
        <Input
          placeholder="Search by region, status code, or error message..."
          value={filters.search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateSearch(e.target.value)
          }
          className="max-w-sm"
        />
      </div>
    </div>
  );
}
