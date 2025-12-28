import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@lib/utils";
import { getRouteApi, Link } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { formatDistanceToNowStrict } from "date-fns";
import { ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { MonitorResponse } from "../schemas";
import { getTextStatusColor } from "../utils/get-status-color";

export default function MonitorsTable() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/");
  const monitors = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "up" | "down" | "degraded" | "all"
  >("all");

  const statusCounts = useMemo(() => {
    const up = monitors.filter((m) => m.status === "up").length;
    const down = monitors.filter((m) => m.status === "down").length;
    const degraded = monitors.filter((m) => m.status === "degraded").length;
    return { up, down, degraded };
  }, [monitors]);

  const columns: ColumnDef<MonitorResponse>[] = [
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={"text-muted-foreground font-normal"}
          >
            Status
            <ChevronsUpDown className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className={cn("capitalize", getTextStatusColor(status))}>
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={"text-muted-foreground font-normal"}
          >
            Type
            <ChevronsUpDown className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <span className="font-light text-xs tracking-tight uppercase">
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={"text-muted-foreground font-normal"}
          >
            Name
            <ChevronsUpDown className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },

    {
      accessorKey: "url",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={"text-muted-foreground font-normal"}
          >
            URL / Host
            <ChevronsUpDown className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const monitor = row.original;
        const value = monitor.type === "http" ? monitor.url : monitor.host;
        return (
          <span className="text-muted-foreground text-xs">{value || "—"}</span>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a =
          rowA.original.type === "http"
            ? rowA.original.url
            : rowA.original.host;
        const b =
          rowB.original.type === "http"
            ? rowB.original.url
            : rowB.original.host;
        return (a || "").localeCompare(b || "");
      },
    },
    {
      accessorKey: "lastCheckAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={"text-muted-foreground font-normal"}
          >
            Last Check
            <ChevronsUpDown className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const lastCheckAt = row.getValue("lastCheckAt") as number | null;
        return (
          <div className="text-xs font-mono tracking-tight text-muted-foreground">
            {lastCheckAt
              ? formatDistanceToNowStrict(lastCheckAt, {
                  addSuffix: true,
                })
              : "—"}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.lastCheckAt ?? 0;
        const b = rowB.original.lastCheckAt ?? 0;
        return a - b;
      },
    },
    {
      accessorKey: "lastResponseTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={"text-muted-foreground font-normal"}
            title="Last check response time"
          >
            Response time
            <ChevronsUpDown className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const lastResponseTime = row.getValue("lastResponseTime") as
          | number
          | null;
        return (
          <div className="text-xs font-mono" title="Last check response time">
            {lastResponseTime ? `${lastResponseTime}ms` : "—"}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.lastResponseTime ?? 0;
        const b = rowB.original.lastResponseTime ?? 0;
        return a - b;
      },
    },
  ];

  const filteredData = useMemo(() => {
    let filtered = monitors;

    if (statusFilter !== "all") {
      filtered = filtered.filter((monitor) => {
        if (statusFilter === "up") {
          return monitor.status === "up";
        }
        if (statusFilter === "down") {
          return monitor.status === "down";
        }
        if (statusFilter === "degraded") {
          return monitor.status === "degraded";
        }
        return true;
      });
    }

    if (nameFilter) {
      filtered = filtered.filter((monitor) =>
        monitor.name.toLowerCase().includes(nameFilter.toLowerCase()),
      );
    }

    return filtered;
  }, [monitors, statusFilter, nameFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-2 bg-surface rounded p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === "up" ? "default" : "outline"}
            size="xs"
            disabled={statusCounts.up === 0}
            onClick={() =>
              setStatusFilter(statusFilter === "up" ? "all" : "up")
            }
          >
            Up
            {statusCounts.up > 0 && <span>({statusCounts.up})</span>}
          </Button>
          <Button
            variant={statusFilter === "down" ? "default" : "outline"}
            size="xs"
            disabled={statusCounts.down === 0}
            onClick={() =>
              setStatusFilter(statusFilter === "down" ? "all" : "down")
            }
          >
            Down
            {statusCounts.down > 0 && <span>({statusCounts.down})</span>}
          </Button>
          <Button
            variant={statusFilter === "degraded" ? "default" : "outline"}
            size="xs"
            disabled={statusCounts.degraded === 0}
            onClick={() =>
              setStatusFilter(statusFilter === "degraded" ? "all" : "degraded")
            }
          >
            Degraded
            {statusCounts.degraded > 0 && (
              <span>({statusCounts.degraded})</span>
            )}
          </Button>
        </div>
        <Input
          placeholder="Search by name..."
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
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const monitor = row.original;
                return (
                  <TableRow
                    key={row.id}
                    className="border-none cursor-pointer hover:bg-muted/50"
                  >
                    <Link
                      to="/$teamId/monitors/$monitorId"
                      params={{
                        teamId,
                        monitorId: monitor.id.toString(),
                      }}
                      className="contents"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
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
                  No monitors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
