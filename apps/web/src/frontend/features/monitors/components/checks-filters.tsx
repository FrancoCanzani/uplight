import { useMemo } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInfiniteChecks } from "../api/use-infinite-checks";
import getLocationLabel from "../utils/get-location-label";

const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");

export function ChecksFilters({
  isFetchingMore,
}: {
  isFetchingMore?: boolean;
}) {
  const { teamId, monitorId } = routeApi.useParams();
  const search = routeApi.useSearch() || {};
  const navigate = useNavigate();

  const { data } = useInfiniteChecks({
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

  const availableResults = useMemo(() => {
    const unique = new Set(checks.map((check) => check.result));
    return Array.from(unique)
      .filter((r) => r)
      .sort()
      .map((value) => ({ value }));
  }, [checks]);

  const availableLocations = useMemo(() => {
    const unique = new Set(checks.map((check) => check.location));
    return Array.from(unique)
      .filter((l) => l)
      .sort()
      .map((value) => ({ value, label: getLocationLabel(value) }));
  }, [checks]);

  const selectedResultLabel = useMemo(() => {
    if (!search.checkResult) return "All results";
    return (
      search.checkResult.charAt(0).toUpperCase() + search.checkResult.slice(1)
    );
  }, [search.checkResult]);

  const selectedLocationLabel = useMemo(() => {
    if (!search.checkLocation) return "All regions";
    return getLocationLabel(search.checkLocation) ?? "All regions";
  }, [search.checkLocation]);

  const updateFilter = (
    key: "checkResult" | "checkLocation" | "checkDateFrom" | "checkDateTo",
    value: string | undefined,
  ) => {
    navigate({
      to: "/$teamId/monitors/$monitorId",
      params: { teamId, monitorId },
      search: (prev) => {
        const updated = { ...prev };
        if (value) {
          updated[key] = value;
        } else {
          delete updated[key];
        }
        return updated;
      },
    });
  };

  const dateFromValue = search.checkDateFrom
    ? new Date(Number(search.checkDateFrom)).toISOString().slice(0, 16)
    : "";

  const dateToValue = search.checkDateTo
    ? new Date(Number(search.checkDateTo)).toISOString().slice(0, 16)
    : "";

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const selectedDate = new Date(value);
      const now = new Date();
      if (selectedDate > now) {
        return;
      }
      updateFilter("checkDateFrom", String(selectedDate.getTime()));
    } else {
      updateFilter("checkDateFrom", undefined);
    }
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const selectedDate = new Date(value);
      const now = new Date();
      if (selectedDate > now) {
        return;
      }
      updateFilter("checkDateTo", String(selectedDate.getTime()));
    } else {
      updateFilter("checkDateTo", undefined);
    }
  };

  const maxDate = new Date().toISOString().slice(0, 16);

  const hasActiveFilters = !!(
    search.checkResult ||
    search.checkLocation ||
    search.checkDateFrom ||
    search.checkDateTo
  );

  const handleClearFilters = () => {
    navigate({
      to: "/$teamId/monitors/$monitorId",
      params: { teamId, monitorId },
      search: (prev) => {
        if (!prev) return {};
        const excludedKeys = new Set([
          "checkResult",
          "checkLocation",
          "checkDateFrom",
          "checkDateTo",
        ]);
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => !excludedKeys.has(key)),
        );
      },
    });
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-start justify-start gap-2 flex-wrap">
        <div className="space-y-2">
          <Label htmlFor="result-filter">Result</Label>
          <Select
            value={search.checkResult ?? ""}
            onValueChange={(value) =>
              updateFilter("checkResult", value || undefined)
            }
          >
            <SelectTrigger id="result-filter" size="sm">
              <SelectValue>{selectedResultLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All results</SelectItem>
              {availableResults.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="capitalize"
                >
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-filter">Region</Label>
          <Select
            value={search.checkLocation ?? ""}
            onValueChange={(value) =>
              updateFilter("checkLocation", value || undefined)
            }
          >
            <SelectTrigger id="location-filter" size="sm">
              <SelectValue>{selectedLocationLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent className={"min-w-min"}>
              <SelectItem value="">All regions</SelectItem>
              {availableLocations.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-from">Date From</Label>
          <Input
            className="h-7"
            id="date-from"
            type="datetime-local"
            value={dateFromValue}
            onChange={handleDateFromChange}
            max={maxDate}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-to">Date To</Label>
          <Input
            className="h-7"
            id="date-to"
            type="datetime-local"
            value={dateToValue}
            onChange={handleDateToChange}
            max={maxDate}
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 ml-auto">
        {isFetchingMore && (
          <span className="text-xs text-muted-foreground">
            Loading more data...
          </span>
        )}
        {hasActiveFilters && (
          <Button variant="outline" size="xs" onClick={handleClearFilters}>
            <FilterX className="size-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
