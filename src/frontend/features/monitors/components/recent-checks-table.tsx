import NoDataMessage from "@/components/no-data-message";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@lib/utils";
import type { CheckResult } from "../api/fetch-checks";
import getLocationLabel from "../utils/get-location-label";
import getStatusColor from "../utils/get-status-color";

export default function RecentChecksTable({
  checks,
}: {
  checks: CheckResult[];
}) {
  const recentChecks = checks.slice(0, 10);

  if (recentChecks.length === 0) {
    return <NoDataMessage text="No checks recorded" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Response (ms)</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentChecks.map((check) => (
          <TableRow key={check.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(check.result)}`}
                />
                <span className="capitalize">{check.result}</span>
              </div>
            </TableCell>
            <TableCell className="tabular-nums">
              {check.statusCode ?? "—"}
            </TableCell>
            <TableCell className="">
              {getLocationLabel(check.location)}
            </TableCell>
            <TableCell className="tabular-nums font-mono">
              {check.responseTime}ms
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(check.checkedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
