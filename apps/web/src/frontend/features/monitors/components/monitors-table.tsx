import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MonitorResponse } from "../schemas";
import MonitorsBulkBar from "./monitors-bulk-bar";
import { monitorsTableColumns } from "./monitors-table-columns";

interface MonitorsTableProps {
  monitors: MonitorResponse[];
  teamId: string;
}

export default function MonitorsTable({
  monitors,
  teamId,
}: MonitorsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data: monitors,
    columns: monitorsTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(row.id),
    state: {
      sorting,
      rowSelection,
    },
  });

  const selectedIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map(Number);

  return (
    <>
      <div className="overflow-x-auto">
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
                      header.column.id === "select" && "w-8 px-2",
                      header.column.getCanSort() &&
                        "cursor-pointer select-none",
                    )}
                    onClick={
                      header.column.id !== "select"
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
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
                  index < array.length - 1 && "border-b!",
                  row.getIsSelected() && "bg-muted/50",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id === "select" && "w-8 px-2",
                    )}
                  >
                    {cell.column.id === "select" ? (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    ) : (
                      <Link
                        to="/$teamId/monitors/$monitorId"
                        params={{
                          teamId,
                          monitorId: row.original.id.toString(),
                        }}
                        className="block"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Link>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <MonitorsBulkBar
        selectedIds={selectedIds}
        monitors={monitors}
        teamId={teamId}
        onClearSelection={() => setRowSelection({})}
      />
    </>
  );
}
