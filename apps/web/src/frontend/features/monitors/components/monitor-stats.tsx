import { useMemo } from "react";
import { getRouteApi } from "@tanstack/react-router";
import AnimatedNumber from "@/components/motion/animated-number";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@lib/utils";
import type { CheckResult } from "../api/fetch-checks";
import calculatePercentiles from "../utils/calculate-percentiles";

const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");

interface MonitorStatsProps {
  filteredChecks: CheckResult[];
}

export function MonitorStats({ filteredChecks }: MonitorStatsProps) {
  const { stats } = routeApi.useLoaderData();
  const search = routeApi.useSearch();
  const { period } = search;

  const periodDays = Number(period || 7);
  const periodLabel =
    periodDays === 1
      ? "1 day"
      : periodDays === 7
        ? "7 days"
        : `${periodDays} days`;

  const percentileStats = useMemo(() => {
    const times = filteredChecks
      .filter((c) => c.responseTime > 0)
      .map((c) => c.responseTime);

    if (times.length === 0) {
      return { 50: 0, 75: 0, 95: 0, 99: 0 };
    }

    return calculatePercentiles(times, [50, 75, 95, 99]);
  }, [filteredChecks]);
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card size="xs">
        <CardHeader>
          <CardDescription>Uptime ({periodLabel})</CardDescription>
          <CardTitle className="text-lg">
            <AnimatedNumber
              value={stats.uptimePercentage}
              decimals={2}
              suffix="%"
            />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card size="xs">
        <CardHeader>
          <CardDescription>Avg Response Time</CardDescription>
          <CardTitle className="text-lg">
            <AnimatedNumber value={stats.avgResponseTime} suffix="ms" />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card size="xs">
        <CardHeader>
          <CardDescription>P50 Response Time</CardDescription>
          <CardTitle className="text-lg">
            <AnimatedNumber value={percentileStats[50]} suffix="ms" />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card size="xs">
        <CardHeader>
          <CardDescription>P75 Response Time</CardDescription>
          <CardTitle className="text-lg">
            <AnimatedNumber value={percentileStats[75]} suffix="ms" />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card size="xs">
        <CardHeader>
          <CardDescription>P95 Response Time</CardDescription>
          <CardTitle className="text-lg">
            <AnimatedNumber value={percentileStats[95]} suffix="ms" />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card size="xs">
        <CardHeader>
          <CardDescription>P99 Response Time</CardDescription>
          <CardTitle className="text-lg">
            <AnimatedNumber value={percentileStats[99]} suffix="ms" />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card size="xs">
        <CardHeader>
          <CardDescription>Total Checks</CardDescription>
          <CardTitle className="text-lg">
            <AnimatedNumber value={stats.totalChecks} />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card size="xs">
        <CardHeader>
          <CardDescription>Last Check</CardDescription>
          <CardTitle className="tabular-nums text-lg font-light">
            {stats.lastCheckAt ? formatDate(stats.lastCheckAt) : "-"}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
