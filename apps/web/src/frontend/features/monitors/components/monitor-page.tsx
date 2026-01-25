import { useMemo } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowRight } from "lucide-react";
import AnimatedNumber from "@/components/motion/animated-number";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Incident } from "@/features/monitors/api/fetch-incidents";
import { formatCause, formatDate } from "@lib/utils";
import calculatePercentiles from "../utils/calculate-percentiles";
import getLocationLabel from "../utils/get-location-label";
import { getBgStatusColor } from "../utils/get-status-color";
import CheckStatusChart from "./check-status-chart";
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
  const { monitor, stats, checks, incidents } = routeApi.useLoaderData();
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

  const openIncidents = useMemo(() => {
    const incidentList = Array.isArray(incidents) ? incidents : [];
    return (incidentList as Incident[]).filter(
      (i) => i.status === "ongoing" || i.status === "acknowledged" || i.status === "fixing"
    );
  }, [incidents]);

  return (
    <div className="space-y-10 w-full lg:max-w-4xl mx-auto">
      <PageHeader
        title={monitor.name}
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

      <div className="flex items-center justify-start gap-x-1.5 flex-wrap">
        <span>Data from</span>
        <TimePeriodFilter
          teamId={teamId}
          monitorId={monitorId}
          currentPeriod={period}
        />
        {showRegionFilter ? (
          <>
            <span>in</span>
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
              <span>in</span>
              <span className="text-muted-foreground">
                {getLocationLabel(availableRegions[0])}
              </span>
            </>
          )
        )}
      </div>

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

      <div className="space-y-4">
        <h3 className="font-medium">Check Status</h3>
        <CheckStatusChart checks={filteredChecks} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Response Time</h3>
          <ResponseTimeStats checks={filteredChecks} />
        </div>

        <ResponseTimeChart checks={filteredChecks} />
      </div>

      {openIncidents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Open Incidents</h3>
            <Link
              to="/$teamId/incidents"
              params={{ teamId }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-0">
            {openIncidents.map((incident) => (
              <Link
                key={incident.id}
                to="/$teamId/incidents/$incidentId"
                params={{ teamId, incidentId: incident.id.toString() }}
                className="flex items-center justify-between gap-4 py-2 px-3 hover:bg-surface transition-colors border-b border-border/30 last:border-b-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`size-1.5 rounded-full shrink-0 ${getBgStatusColor(incident.status === "ongoing" ? "down" : "degraded")}`}
                  />
                  <span className="text-xs capitalize text-muted-foreground shrink-0">
                    {incident.status}
                  </span>
                  <span className="text-sm truncate">
                    {incident.title ?? formatCause(incident.cause)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNowStrict(new Date(incident.startedAt), {
                    addSuffix: true,
                  })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-medium">Check Logs</h3>
        <ChecksTable />
      </div>
    </div>
  );
}
