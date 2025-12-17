import AnimatedNumber from "@/components/motion/animated-number";
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
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <MonitorHeader
          monitor={monitor}
          teamId={teamId}
          monitorId={monitorId}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="xs">
          <CardHeader>
            <CardDescription>Uptime (30d)</CardDescription>
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
            <CardDescription>Avg Response</CardDescription>
            <CardTitle className="text-lg">
              <AnimatedNumber value={stats.avgResponseTime} suffix="ms" />
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
            <CardTitle className="text-lg">
              {stats.lastCheckAt ? formatDate(stats.lastCheckAt) : "-"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Response Time</h3>
          <ResponseTimeStats checks={filteredChecks} />
        </div>
        <ResponseTimeChart checks={filteredChecks} />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-medium">Recent Checks</h3>
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
  );
}
