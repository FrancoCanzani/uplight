import AnimatedNumber from "@/components/motion/animated-number";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@lib/utils";
import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import calculatePercentiles from "../utils/calculate-percentiles";
import getLocationLabel from "../utils/get-location-label";
import ChecksTable from "./checks-table";
import MonitorActions from "./monitor-actions";
import MonitorDomainInfo from "./monitor-domain-info";
import MonitorInfoSheet from "./monitor-info-sheet";
import MonitorStatusAlert from "./monitor-status-alert";
import RegionFilter from "./region-filter";
import ResponseTimeChart from "./response-time-chart";
import ResponseTimeStats from "./response-time-stats";
import TimePeriodFilter from "./time-period-filter";

export default function MonitorPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");
  const { monitor, stats, checks } = routeApi.useLoaderData();
  const { teamId, monitorId } = routeApi.useParams();
  const search = routeApi.useSearch();
  const { region, period } = search;

  const availableRegions = [...new Set(checks.map((c) => c.location))];
  const showRegionFilter = availableRegions.length > 1;

  const periodDays = Number(period || 7);
  const periodLabel =
    periodDays === 1
      ? "1 day"
      : periodDays === 7
        ? "7 days"
        : `${periodDays} days`;

  const filteredChecks = region
    ? checks.filter((c) => c.location === region)
    : checks;

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
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <PageHeader
        title={monitor.name}
        subtitle={monitor.url || (monitor.host ? `${monitor.host}:${monitor.port}` : undefined)}
        backLink={{ to: "/$teamId/monitors", params: { teamId } }}
        actions={
          <>
            <MonitorDomainInfo monitor={monitor} />
            <MonitorInfoSheet monitor={monitor} />
            <MonitorActions />
          </>
        }
      />

      {(monitor.status === "down" ||
        monitor.status === "degraded" ||
        monitor.status === "maintenance") && (
        <MonitorStatusAlert status={monitor.status} />
      )}

      <div className="flex items-center justify-start gap-x-1.5">
        Data from
        <TimePeriodFilter
          teamId={teamId}
          monitorId={monitorId}
          currentPeriod={period}
        />
        {showRegionFilter ? (
          <>
            in
            <RegionFilter
              teamId={teamId}
              monitorId={monitorId}
              currentRegion={region}
              availableRegions={availableRegions}
            />
          </>
        ) : (
          availableRegions[0] && (
            <>
              in{" "}
              <span className="text-muted-foreground">
                {getLocationLabel(availableRegions[0])}
              </span>
            </>
          )
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="tabular-nums text-lg font-mono font-light">
              {stats.lastCheckAt ? formatDate(stats.lastCheckAt) : "-"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Response Time</h3>
          <ResponseTimeStats checks={filteredChecks} />
        </div>

        <ResponseTimeChart checks={filteredChecks} />
      </div>

      <div className="space-y-12">
        <h3 className="font-medium">Check Logs</h3>
        <ChecksTable />
      </div>
    </div>
  );
}
