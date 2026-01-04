import { useState, useMemo } from "react";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { CalendarIcon, XIcon, FileText } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import {
  formatDate,
  formatDateShort,
  formatDuration,
  formatCause,
} from "@lib/utils";
import type { Incident } from "../types";
import type { MonitorResponse } from "@/features/monitors/schemas";
import { SEVERITY_COLORS, STATUS_TEXT_COLORS } from "../constants";

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

  const [sorting, setSorting] = useState<SortingState>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "resolved" | "all"
  >("all");

  const currentOffset = Number(search.offset ?? 0);
  const currentMonitorId = search.monitorId;
  const currentFrom = search.from;
  const currentTo = search.to;

  const statusCounts = useMemo(() => {
    const active = incidents.filter(
      (i: Incident) => i.status !== "resolved"
    ).length;
    const resolved = incidents.filter(
      (i: Incident) => i.status === "resolved"
    ).length;
    return { active, resolved };
  }, [incidents]);

  const columns: ColumnDef<Incident>[] = [
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-muted-foreground font-normal"
        >
          Status
          <ChevronsUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue(
          "status"
        ) as keyof typeof STATUS_TEXT_COLORS;
        return (
          <span className={`capitalize ${STATUS_TEXT_COLORS[status]}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "monitorName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-muted-foreground font-normal"
        >
          Monitor
          <ChevronsUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("monitorName")}</span>
      ),
    },
    {
      accessorKey: "cause",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-muted-foreground font-normal"
        >
          Issue
          <ChevronsUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const incident = row.original;
        return (
          <span className="text-muted-foreground text-xs">
            {incident.title ?? formatCause(incident.cause)}
          </span>
        );
      },
    },
    {
      accessorKey: "severity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-muted-foreground font-normal"
        >
          Severity
          <ChevronsUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const severity = row.getValue("severity") as
          | keyof typeof SEVERITY_COLORS
          | null;
        if (!severity) return <span className="text-muted-foreground">—</span>;
        return (
          <Badge
            variant="outline"
            className={`capitalize ${SEVERITY_COLORS[severity]}`}
          >
            {severity}
          </Badge>
        );
      },
    },
    {
      accessorKey: "startedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-muted-foreground font-normal"
        >
          Duration
          <ChevronsUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const incident = row.original;
        const duration = incident.resolvedAt
          ? incident.resolvedAt - incident.startedAt
          : Date.now() - incident.startedAt;
        return (
          <span className="text-xs font-mono tabular-nums text-muted-foreground">
            {formatDuration(duration)}
          </span>
        );
      },
    },
    {
      accessorKey: "postMortemTitle",
      header: () => (
        <span className="text-muted-foreground font-normal text-xs">
          Post Mortem
        </span>
      ),
      cell: ({ row }) => {
        const incident = row.original;
        const hasPostMortem =
          incident.postMortemTitle || incident.postMortemContent;
        return hasPostMortem ? (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="size-3.5" />
            <span className="text-xs truncate max-w-[120px]">
              {incident.postMortemTitle || "Written"}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: "date",
      accessorFn: (row) => row.startedAt,
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-muted-foreground font-normal"
        >
          Started
          <ChevronsUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.startedAt)}
        </span>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    let filtered = incidents as Incident[];

    if (statusFilter !== "all") {
      filtered = filtered.filter((incident) => {
        if (statusFilter === "resolved") return incident.status === "resolved";
        return incident.status !== "resolved";
      });
    }

    if (nameFilter) {
      filtered = filtered.filter(
        (incident) =>
          incident.monitorName
            .toLowerCase()
            .includes(nameFilter.toLowerCase()) ||
          (incident.title?.toLowerCase().includes(nameFilter.toLowerCase()) ??
            false) ||
          incident.cause.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    return filtered;
  }, [incidents, statusFilter, nameFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

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
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <header className="w-full flex items-center justify-between">
        <h1 className="text-2xl tracking-tight text-balance">Incidents</h1>
        <p className="text-muted-foreground text-sm">
          {total} incident{total !== 1 ? "s" : ""} recorded
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4 pb-4 border-b border-border">
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
        <div className="space-y-2 bg-surface rounded p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="xs"
                disabled={statusCounts.active === 0}
                onClick={() =>
                  setStatusFilter(statusFilter === "active" ? "all" : "active")
                }
              >
                Active
                {statusCounts.active > 0 && (
                  <span>({statusCounts.active})</span>
                )}
              </Button>
              <Button
                variant={statusFilter === "resolved" ? "default" : "outline"}
                size="xs"
                disabled={statusCounts.resolved === 0}
                onClick={() =>
                  setStatusFilter(
                    statusFilter === "resolved" ? "all" : "resolved"
                  )
                }
              >
                Resolved
                {statusCounts.resolved > 0 && (
                  <span>({statusCounts.resolved})</span>
                )}
              </Button>
            </div>
            <Input
              placeholder="Search..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-fit h-7 bg-background"
            />
          </div>

          <div className="rounded p-1 bg-background overflow-x-scroll">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-none hover:bg-background"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        className="p-0"
                        key={header.id}
                        style={{
                          width:
                            header.getSize() !== 150
                              ? header.getSize()
                              : undefined,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const incident = row.original;
                    return (
                      <TableRow
                        key={row.id}
                        className="border-none cursor-pointer hover:bg-muted/50"
                      >
                        <Link
                          to="/$teamId/incidents/$incidentId"
                          params={{
                            teamId,
                            incidentId: incident.id.toString(),
                          }}
                          className="contents"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </Link>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No incidents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore}>
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
