import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CheckResult } from "../api/fetch-checks";
import getLocationLabel from "../utils/get-location-label";

type SortField = "location" | "uptime" | "avgResponseTime" | "failures";
type SortDirection = "asc" | "desc";

interface LocationStats {
  location: string;
  uptime: number;
  avgResponseTime: number;
  failures: number;
  totalChecks: number;
}

export default function LocationComparisonTable({
  checks,
}: {
  checks: CheckResult[];
}) {
  const [sortField, setSortField] = useState<SortField>("uptime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const locationStats = useMemo(() => {
    const byLocation: Record<string, LocationStats> = {};

    checks.forEach((check) => {
      if (!byLocation[check.location]) {
        byLocation[check.location] = {
          location: check.location,
          uptime: 0,
          avgResponseTime: 0,
          failures: 0,
          totalChecks: 0,
        };
      }

      const stats = byLocation[check.location];
      stats.totalChecks++;

      if (check.result === "success" || check.result === "degraded") {
        stats.uptime++;
      } else {
        stats.failures++;
      }

      if (check.responseTime > 0) {
        stats.avgResponseTime += check.responseTime;
      }
    });

    // Calculate percentages and averages
    Object.values(byLocation).forEach((stats) => {
      stats.uptime = (stats.uptime / stats.totalChecks) * 100;
      stats.avgResponseTime = Math.round(
        stats.avgResponseTime / stats.totalChecks,
      );
    });

    return Object.values(byLocation);
  }, [checks]);

  const sortedStats = useMemo(() => {
    const sorted = [...locationStats].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortField) {
        case "location":
          aVal = getLocationLabel(a.location);
          bVal = getLocationLabel(b.location);
          break;
        case "uptime":
          aVal = a.uptime;
          bVal = b.uptime;
          break;
        case "avgResponseTime":
          aVal = a.avgResponseTime;
          bVal = b.avgResponseTime;
          break;
        case "failures":
          aVal = a.failures;
          bVal = b.failures;
          break;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return sorted;
  }, [locationStats, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return "text-green-700";
    if (uptime >= 95) return "text-yellow-700";
    return "text-red-700";
  };

  if (locationStats.length <= 1) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Performance</CardTitle>
        <CardDescription>
          Compare reliability and response times across locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("location")}
                  >
                    Location
                    <SortIcon field="location" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("uptime")}
                  >
                    Uptime
                    <SortIcon field="uptime" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("avgResponseTime")}
                  >
                    Avg Response
                    <SortIcon field="avgResponseTime" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("failures")}
                  >
                    Failures
                    <SortIcon field="failures" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Checks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStats.map((stats) => (
                <TableRow key={stats.location}>
                  <TableCell className="font-medium">
                    {getLocationLabel(stats.location)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${getUptimeColor(stats.uptime)}`}
                  >
                    {stats.uptime.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {stats.avgResponseTime}ms
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {stats.failures}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {stats.totalChecks}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
