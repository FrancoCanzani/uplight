import AnimatedNumber from "@/components/motion/animated-number";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@lib/utils";
import { getRouteApi, Link } from "@tanstack/react-router";
import getLocationLabel from "../utils/get-location-label";
import LatestIncident from "./latest-incident";
import MonitorHeader from "./monitor-header";
import RecentChecksTable from "./recent-checks-table";
import RegionFilter from "./region-filter";
import ResponseTimeChart from "./response-time-chart";
import ResponseTimeStats from "./response-time-stats";
import TimePeriodFilter from "./time-period-filter";

export default function MonitorPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");
  const { monitor, stats, checks, incidents } = routeApi.useLoaderData();
  const { teamId, monitorId } = routeApi.useParams();
  const search = routeApi.useSearch() || {};
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

  const latestIncident = incidents;
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Recent Checks</h3>
          <Link
            to="/$teamId/logs"
            params={{
              teamId,
            }}
            className="text-xs hover:underline text-muted-foreground hover:text-primary"
          >
            See all
          </Link>
        </div>
        <RecentChecksTable checks={filteredChecks} />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Latest incident</h3>
        <LatestIncident
          incident={latestIncident}
          teamId={teamId}
          monitorId={monitorId}
        />
      </div>
    </div>
  );
}
