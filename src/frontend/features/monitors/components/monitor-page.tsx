import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@lib/utils";
import { getRouteApi } from "@tanstack/react-router";
import LatestIncident from "./latest-incident";
import MonitorHeader from "./monitor-header";
import RecentChecksTable from "./recent-checks-table";
import ResponseTimeChart from "./response-time-chart";
import ResponseTimeStats from "./response-time-stats";

export default function MonitorPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");
  const { monitor, stats, checks, incidents } = routeApi.useLoaderData();
  const { teamId, monitorId } = routeApi.useParams();
  const { region } = routeApi.useSearch();

  const latestIncident = incidents[0] ?? null;
  const filteredChecks = region
    ? checks.filter((c) => c.location === region)
    : checks;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <MonitorHeader
          monitor={monitor}
          teamId={teamId}
          monitorId={monitorId}
        />
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

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Response Time</h2>
        <ResponseTimeChart checks={filteredChecks} />
        <ResponseTimeStats checks={filteredChecks} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Recent Checks</h2>
          <RecentChecksTable checks={filteredChecks} />
        </div>
        <div>
          <LatestIncident
            incident={latestIncident}
            teamId={teamId}
            monitorId={monitorId}
          />
        </div>
      </div>
    </div>
  );
}
