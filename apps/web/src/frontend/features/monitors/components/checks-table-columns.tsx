import { formatDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import type { CheckResult } from "../api/fetch-checks-paginated";
import getLocationLabel from "../utils/get-location-label";
import { mapCheckStatusToMonitorStatus } from "../utils/map-check-status";
import MonitorStatusIndicator from "./monitor-status-indicator";

export const checksTableColumns: ColumnDef<CheckResult>[] = [
  {
    accessorKey: "result",
    header: "Status",
    cell: ({ row }) => {
      const result = row.getValue("result") as string;
      const status = mapCheckStatusToMonitorStatus(result);
      return (
        <div className="w-full px-3">
          <MonitorStatusIndicator status={status} />
        </div>
      );
    },
  },
  {
    accessorKey: "statusCode",
    header: "Code",
    cell: ({ row }) => {
      const code = row.getValue("statusCode") as number | null;
      return <span className="font-mono tabular-nums">{code ?? "—"}</span>;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("location") as string;
      return <span>{getLocationLabel(location)}</span>;
    },
  },
  {
    accessorKey: "responseTime",
    header: "Response (ms)",
    cell: ({ row }) => {
      const time = row.getValue("responseTime") as number;
      return <span className="font-mono tabular-nums">{time}ms</span>;
    },
  },
  {
    accessorKey: "checkedAt",
    header: "Time",
    cell: ({ row }) => {
      const timestamp = row.getValue("checkedAt") as number;
      return (
        <time
          dateTime={new Date(timestamp).toLocaleString()}
          className="font-mono tracking-tight"
        >
          {formatDate(timestamp)}
        </time>
      );
    },
  },
];
