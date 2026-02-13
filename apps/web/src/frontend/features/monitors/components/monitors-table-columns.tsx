import { type ColumnDef } from "@tanstack/react-table";
import type { MonitorResponse } from "../schemas";
import ChecksVisualization from "./checks-visualization";
import MonitorStatusIndicator from "./monitor-status-indicator";
import MonitorTableRowActions from "./monitors-table-row-actions";

function formatDnsRecordTypes(raw: string | null): string {
  if (!raw) return "A";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.join(", ");
    }
  } catch {
    return raw;
  }
  return "A";
}

export const monitorsTableColumns: ColumnDef<MonitorResponse>[] = [
  {
    accessorKey: "status",
    header: "",
    cell: ({ row }) => <MonitorStatusIndicator status={row.original.status} />,
    enableSorting: true,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="truncate max-w-xs block">{row.original.name}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-muted-foreground uppercase">
        {row.original.type}
      </span>
    ),
    enableSorting: true,
  },
  {
    id: "endpoint",
    header: "Endpoint",
    accessorFn: (row) => {
      if (row.type === "http") return row.url;
      if (row.type === "dns")
        return `${row.host} (${formatDnsRecordTypes(row.dnsRecordType)})`;
      return `${row.host}:${row.port}`;
    },
    cell: ({ row }) => {
      const endpoint =
        row.original.type === "http"
          ? row.original.url
          : row.original.type === "dns"
            ? `${row.original.host} (${formatDnsRecordTypes(row.original.dnsRecordType)})`
            : `${row.original.host}:${row.original.port}`;
      return (
        <span className="text-muted-foreground truncate max-w-xs block">
          {endpoint}
        </span>
      );
    },
    enableSorting: true,
    meta: {
      headerClassName: "hidden xl:table-cell",
      cellClassName: "hidden xl:table-cell",
    },
  },
  {
    accessorKey: "interval",
    header: "Interval",
    cell: ({ row }) => {
      const seconds = Math.floor(row.original.interval / 1000);
      const minutes = Math.floor(seconds / 60);
      return (
        <span className="text-muted-foreground">
          {minutes > 0 ? `${minutes}m` : `${seconds}s`}
        </span>
      );
    },
    enableSorting: true,
    meta: {
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell",
    },
  },
  {
    accessorKey: "lastResponseTime",
    header: "Avg. Response",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.lastResponseTime
          ? `${row.original.lastResponseTime}ms`
          : "—"}
      </span>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.lastResponseTime ?? 0;
      const b = rowB.original.lastResponseTime ?? 0;
      return a - b;
    },
  },
  {
    id: "recentChecks",
    header: "Recent Checks",
    cell: ({ row }) => (
      <div>
        <ChecksVisualization
          checks={row.original.recentChecks}
          maxChecks={15}
        />
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <MonitorTableRowActions monitor={row.original} />,
    enableSorting: false,
  },
];
