import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@lib/utils";
import getStatusColor from "../utils/get-status-color";
import getLocationLabel from "../utils/get-location-label";
import type { CheckResult } from "../api/fetch-checks";

interface RecentChecksTableProps {
  checks: CheckResult[];
}

export default function RecentChecksTable({ checks }: RecentChecksTableProps) {
  const recentChecks = checks.slice(0, 10);

  if (recentChecks.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        No checks recorded
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Response</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentChecks.map((check) => (
          <TableRow key={check.id}>
            <TableCell className="font-medium">
              {getLocationLabel(check.location)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(check.status)}`}
                />
                <span className="capitalize">{check.status}</span>
              </div>
            </TableCell>
            <TableCell className="tabular-nums">{check.responseTime}ms</TableCell>
            <TableCell className="tabular-nums">{check.statusCode ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(check.checkedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

