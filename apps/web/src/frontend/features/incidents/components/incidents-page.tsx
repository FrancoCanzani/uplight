import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, XIcon } from "lucide-react";
import {
  formatDate,
  formatDateShort,
  formatDuration,
  formatCause,
} from "@lib/utils";
import type { Incident } from "../api/fetch-incidents";
import type { MonitorResponse } from "@/features/monitors/schemas";

interface IncidentRowProps {
  incident: Incident;
}

function IncidentRow({ incident }: IncidentRowProps) {
  const isOngoing = incident.status === "ongoing";
  const duration = incident.resolvedAt
    ? incident.resolvedAt - incident.startedAt
    : Date.now() - incident.startedAt;

  return (
    <TableRow>
      <TableCell className="font-medium">{incident.monitorName}</TableCell>
      <TableCell>{formatCause(incident.cause)}</TableCell>
      <TableCell>
        <Badge variant={isOngoing ? "destructive" : "outline"}>
          {isOngoing ? "Ongoing" : "Resolved"}
        </Badge>
      </TableCell>
      <TableCell className="tabular-nums">{formatDuration(duration)}</TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(incident.startedAt)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {incident.resolvedAt ? formatDate(incident.resolvedAt) : "—"}
      </TableCell>
    </TableRow>
  );
}

type SearchParams = {
  offset?: string;
  monitorId?: string;
  from?: string;
  to?: string;
};

export default function IncidentsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/");
  const { incidents, hasMore, total, monitors } = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();
  const search = routeApi.useSearch();
  const navigate = useNavigate();

  const currentOffset = Number(search.offset ?? 0);
  const currentMonitorId = search.monitorId;
  const currentFrom = search.from;
  const currentTo = search.to;

  function updateSearch(updates: Partial<SearchParams>) {
    const newSearch: SearchParams = { ...search, ...updates };

    (Object.keys(newSearch) as (keyof SearchParams)[]).forEach((key) => {
      if (newSearch[key] === undefined || newSearch[key] === "") {
        delete newSearch[key];
      }
    });

    navigate({
      to: "/$teamId/incidents",
      params: { teamId },
      search: newSearch,
    });
  }

  function handleLoadMore() {
    updateSearch({ offset: String(currentOffset + 20) });
  }

  function handleMonitorChange(value: string | null) {
    if (!value) return;
    updateSearch({
      monitorId: value === "all" ? undefined : value,
      offset: "0",
    });
  }

  function handleFromChange(date: Date | undefined) {
    updateSearch({
      from: date ? String(date.getTime()) : undefined,
      offset: "0",
    });
  }

  function handleToChange(date: Date | undefined) {
    updateSearch({
      to: date ? String(date.getTime()) : undefined,
      offset: "0",
    });
  }

  function clearFilters() {
    navigate({
      to: "/$teamId/incidents",
      params: { teamId },
      search: {},
    });
  }

  const hasFilters = currentMonitorId || currentFrom || currentTo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground text-sm">
            {total} incident{total !== 1 ? "s" : ""} recorded
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 pb-4 border-b">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Monitor</label>
          <Select
            value={currentMonitorId ?? "all"}
            onValueChange={handleMonitorChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue>
                {currentMonitorId
                  ? (monitors.find(
                      (m: MonitorResponse) => String(m.id) === currentMonitorId
                    )?.name ?? "All monitors")
                  : "All monitors"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All monitors</SelectItem>
              {monitors.map((monitor: MonitorResponse) => (
                <SelectItem key={monitor.id} value={String(monitor.id)}>
                  {monitor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">From</label>
          <Popover>
            <PopoverTrigger className="inline-flex items-center justify-start gap-2 h-9 px-3 rounded-sm border border-input bg-input/20 text-xs hover:bg-input/30 w-36">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {currentFrom
                  ? formatDateShort(Number(currentFrom))
                  : "Start date"}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  currentFrom ? new Date(Number(currentFrom)) : undefined
                }
                onSelect={handleFromChange}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">To</label>
          <Popover>
            <PopoverTrigger className="inline-flex items-center justify-start gap-2 h-9 px-3 rounded-sm border border-input bg-input/20 text-xs hover:bg-input/30 w-36">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {currentTo ? formatDateShort(Number(currentTo)) : "End date"}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentTo ? new Date(Number(currentTo)) : undefined}
                onSelect={handleToChange}
              />
            </PopoverContent>
          </Popover>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5"
          >
            <XIcon className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <svg
            className="w-12 h-12 mb-4 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">No incidents found</p>
          {hasFilters && (
            <Button
              variant="link"
              size="sm"
              onClick={clearFilters}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Monitor</TableHead>
                <TableHead>Cause</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Resolved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident: Incident) => (
                <IncidentRow key={incident.id} incident={incident} />
              ))}
            </TableBody>
          </Table>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
