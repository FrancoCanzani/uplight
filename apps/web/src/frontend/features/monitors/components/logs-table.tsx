import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { CheckResult } from "../api/fetch-checks";
import type { MonitorResponse } from "../schemas";
import getLocationLabel from "../utils/get-location-label";

export default function LogsTable({
  checks,
  monitor,
  onRowClick,
}: {
  checks: CheckResult[];
  monitor: MonitorResponse;
  onRowClick: (check: CheckResult) => void;
  preview?: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "checkedAt", desc: true },
  ]);

  const isTcp = monitor.type === "tcp";
  const columnVisibility = {
    statusCode: !isTcp,
  };

  const getRowClassName = (result: string, statusCode: number | null) => {
    if (result === "failure" || (statusCode && statusCode >= 500)) {
      return cn(
        "bg-red-50/50 hover:bg-red-50/70",
        "dark:bg-red-950/20 dark:hover:bg-red-950/30",
      );
    }

    if (result === "timeout") {
      return cn(
        "bg-orange-50/50 hover:bg-orange-50/70",
        "dark:bg-orange-950/20 dark:hover:bg-orange-950/30",
      );
    }
    return "hover:bg-muted/50";
  };

  const getStatusColor = (result: string, statusCode: number | null) => {
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return "text-yellow-700 dark:text-yellow-400";
    }
    if (
      result === "failure" ||
      result === "timeout" ||
      (statusCode && statusCode >= 500)
    ) {
      return "text-red-700 dark:text-red-400";
    }
    return "text-foreground";
  };

  const columns: ColumnDef<CheckResult>[] = [
    {
      accessorKey: "result",
      header: "Result",
      cell: ({ row }) => (
        <span
          className={cn(
            "capitalize",
            getStatusColor(row.original.result, row.original.statusCode),
          )}
        >
          {row.original.result}
        </span>
      ),
    },
    {
      accessorKey: "statusCode",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={cn(
            "font-mono",
            getStatusColor(row.original.result, row.original.statusCode),
          )}
        >
          {row.original.statusCode || "-"}
        </span>
      ),
    },
    {
      accessorKey: "responseTime",
      header: "Latency",
      cell: ({ row }) => (
        <span className="font-mono">{row.original.responseTime}ms</span>
      ),
    },
    {
      accessorKey: "location",
      header: "Region",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {getLocationLabel(row.original.location)}
        </span>
      ),
    },
    {
      accessorKey: "checkedAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="font-mono">
          {format(new Date(row.original.checkedAt), "MMM dd, yyyy HH:mm:ss")}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: checks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      columnVisibility,
    },
  });

  if (checks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        No checks found
      </div>
    );
  }

  return (
    <div className={"overflow-x-auto"}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b font-mono border-border/50"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "font-normal",
                    header.column.getCanSort() && "cursor-pointer select-none",
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {header.column.getCanSort() && (
                      <span className="text-muted-foreground">
                        {header.column.getIsSorted() === "asc"
                          ? "↑"
                          : header.column.getIsSorted() === "desc"
                            ? "↓"
                            : "↕"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, index, array) => (
            <TableRow
              key={row.original.id}
              className={cn(
                "cursor-pointer border-dashed",
                index < array.length - 1 && "border-b",
                getRowClassName(row.original.result, row.original.statusCode),
              )}
              onClick={() => onRowClick(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
