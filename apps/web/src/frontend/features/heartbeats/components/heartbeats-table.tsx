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
import { GRACE_PERIODS } from "../constants";
import type { HeartbeatResponse } from "../schemas";

function getTextStatusColor(status: string): string {
  switch (status) {
    case "up":
      return "text-emerald-600";
    case "down":
      return "text-red-600";
    case "paused":
      return "text-muted-foreground";
    case "initializing":
      return "text-amber-600";
    default:
      return "text-muted-foreground";
  }
}

function formatGracePeriod(seconds: number): string {
  const period = GRACE_PERIODS.find((p) => p.value === seconds);
  return period?.label ?? `${seconds}s`;
}

export default function HeartbeatsTable() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/heartbeats/");
  const heartbeats = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"up" | "down" | "all">(
    "all"
  );

  const statusCounts = useMemo(() => {
    const up = heartbeats.filter((h) => h.status === "up").length;
    const down = heartbeats.filter((h) => h.status === "down").length;
    return { up, down };
  }, [heartbeats]);

  const columns: ColumnDef<HeartbeatResponse>[] = [
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
      accessorKey: "gracePeriod",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={"text-muted-foreground font-normal"}
          >
            Grace Period
            <ChevronsUpDown className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const gracePeriod = row.getValue("gracePeriod") as number;
        return (
          <span className="text-muted-foreground text-xs">
            {formatGracePeriod(gracePeriod)}
          </span>
        );
      },
    },
    {
      accessorKey: "lastPingAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={"text-muted-foreground font-normal"}
          >
            Last Ping
            <ChevronsUpDown className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const lastPingAt = row.getValue("lastPingAt") as number | null;
        return (
          <div className="text-xs font-mono tracking-tight text-muted-foreground">
            {lastPingAt
              ? formatDistanceToNowStrict(lastPingAt, {
                  addSuffix: true,
                })
              : "Never"}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.lastPingAt ?? 0;
        const b = rowB.original.lastPingAt ?? 0;
        return a - b;
      },
    },
  ];

  const filteredData = useMemo(() => {
    let filtered = heartbeats;

    if (statusFilter !== "all") {
      filtered = filtered.filter((heartbeat) => {
        if (statusFilter === "up") {
          return heartbeat.status === "up";
        }
        if (statusFilter === "down") {
          return heartbeat.status === "down";
        }
        return true;
      });
    }

    if (nameFilter) {
      filtered = filtered.filter((heartbeat) =>
        heartbeat.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    return filtered;
  }, [heartbeats, statusFilter, nameFilter]);

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
                const heartbeat = row.original;
                return (
                  <TableRow
                    key={row.id}
                    className="border-none cursor-pointer hover:bg-muted/50"
                  >
                    <Link
                      to="/$teamId/heartbeats/$heartbeatId"
                      params={{
                        teamId,
                        heartbeatId: heartbeat.id.toString(),
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
                  No heartbeats found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
