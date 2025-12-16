import { getRouteApi, Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDuration, formatCause } from "@lib/utils";
import getStatusColor from "../utils/get-status-color";
import getStatusBadgeVariant from "../utils/get-status-badge-variant";
import getLocationLabel from "../utils/get-location-label";
import type { CheckResult } from "../api/fetch-checks";
import type { Incident } from "../api/fetch-incidents";

function StatusTimeline({ checks }: { checks: CheckResult[] }) {
  const grouped = checks.reduce(
    (acc, check) => {
      const hour = new Date(check.checkedAt).toISOString().slice(0, 13);
      if (!acc[hour]) {
        acc[hour] = { success: 0, failure: 0, total: 0 };
      }
      acc[hour].total++;
      if (check.status === "success" || check.status === "maintenance") {
        acc[hour].success++;
      } else {
        acc[hour].failure++;
      }
      return acc;
    },
    {} as Record<string, { success: number; failure: number; total: number }>
  );

  const hours = Object.keys(grouped).sort();
  const last24 = hours.slice(-24);

  if (last24.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
        No check data available
      </div>
    );
  }

  return (
    <div className="flex gap-0.5 items-end h-16">
      {last24.map((hour) => {
        const data = grouped[hour];
        const successRate = data.success / data.total;
        const color =
          successRate === 1
            ? "bg-emerald-500"
            : successRate >= 0.8
              ? "bg-amber-500"
              : "bg-red-500";

        return (
          <div
            key={hour}
            className={`flex-1 min-w-1 rounded-sm ${color} opacity-80 hover:opacity-100 transition-opacity cursor-default`}
            style={{ height: `${Math.max(20, successRate * 100)}%` }}
            title={`${new Date(hour).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit" })}: ${data.success}/${data.total} successful`}
          />
        );
      })}
    </div>
  );
}

function LatestIncidentCard({
  incident,
  teamId,
  monitorId,
}: {
  incident: Incident | null;
  teamId: string;
  monitorId: string;
}) {
  if (!incident) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Incident</CardTitle>
          <CardDescription>No incidents recorded</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <svg
              className="w-12 h-12 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOngoing = incident.status === "ongoing";
  const duration = incident.resolvedAt
    ? incident.resolvedAt - incident.startedAt
    : Date.now() - incident.startedAt;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Latest Incident</CardTitle>
          <Badge variant={isOngoing ? "destructive" : "outline"}>
            {isOngoing ? "Ongoing" : "Resolved"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cause</p>
            <p className="font-medium">{formatCause(incident.cause)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="font-medium">{formatDuration(duration)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Started</p>
            <p className="font-medium">{formatDate(incident.startedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Resolved</p>
            <p className="font-medium">
              {incident.resolvedAt ? formatDate(incident.resolvedAt) : "—"}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t">
          <Link
            to="/$teamId/incidents"
            params={{ teamId }}
            search={{ monitorId }}
            className="text-sm text-primary hover:underline"
          >
            See all incidents →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MonitorPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");
  const { monitor, stats, checks, incidents } = routeApi.useLoaderData();
  const { teamId, monitorId } = routeApi.useParams();

  const latestIncident = incidents[0] ?? null;
  const recentChecks = checks.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(monitor.status)}`}
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            {monitor.name}
          </h1>
          <Badge variant={getStatusBadgeVariant(monitor.status)}>
            {monitor.status.toUpperCase()}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link
            to="/$teamId/monitors/$monitorId/maintenance"
            params={{ teamId, monitorId }}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Maintenance
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Uptime (30d)</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {stats.uptimePercentage.toFixed(2)}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Avg Response</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {stats.avgResponseTime}ms
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total Checks</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {stats.totalChecks.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Last Check</CardDescription>
            <CardTitle className="text-lg">
              {stats.lastCheckAt ? formatDate(stats.lastCheckAt) : "Never"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status Timeline (24h)</CardTitle>
            <CardDescription>
              Hourly check success rate across all locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusTimeline checks={checks} />
          </CardContent>
        </Card>

        <LatestIncidentCard
          incident={latestIncident}
          teamId={teamId}
          monitorId={monitorId}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location Status</CardTitle>
          <CardDescription>
            Current status per monitoring region
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.locationStats.length === 0 ? (
            <p className="text-muted-foreground text-sm">No location data</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.locationStats.map((loc) => (
                <div
                  key={loc.location}
                  className="flex items-center gap-3 p-3 rounded-md bg-muted/50"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(loc.status)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getLocationLabel(loc.location)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {loc.responseTime}ms
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Checks</CardTitle>
          <CardDescription>
            Latest check results from all locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentChecks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No checks recorded</p>
          ) : (
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
                    <TableCell className="tabular-nums">
                      {check.responseTime}ms
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {check.statusCode ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(check.checkedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitor Configuration</CardTitle>
          <CardDescription>Current monitoring settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <p className="font-medium uppercase">{monitor.type}</p>
            </div>
            {monitor.type === "http" && monitor.url && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">URL</p>
                <p className="font-medium truncate">{monitor.url}</p>
              </div>
            )}
            {monitor.type === "tcp" && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Host</p>
                <p className="font-medium">
                  {monitor.host}:{monitor.port}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Interval</p>
              <p className="font-medium">{monitor.interval / 1000}s</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Timeout</p>
              <p className="font-medium">{monitor.timeout / 1000}s</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Locations</p>
              <p className="font-medium">
                {JSON.parse(monitor.locations).length} regions
              </p>
            </div>
            {monitor.type === "http" && monitor.method && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Method</p>
                <p className="font-medium uppercase">{monitor.method}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
