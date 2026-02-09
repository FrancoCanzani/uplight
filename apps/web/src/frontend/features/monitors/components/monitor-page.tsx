import { getRouteApi } from "@tanstack/react-router";
import NoDataMessage from "@/components/no-data-message";
import { PageHeader } from "@/components/page-header";
import getLocationLabel from "../utils/get-location-label";
import CheckStatusChart from "./check-status-chart";
import MonitorActions from "./monitor-actions";
import MonitorDomainInfo from "./monitor-domain-info";
import MonitorInfoSheet from "./monitor-info-sheet";
import { MonitorStats } from "./monitor-stats";
import MonitorStatusAlert from "./monitor-status-alert";
import { RecentLogsPreview } from "./recent-logs-preview";
import RegionFilter from "./region-filter";
import ResponseTimeChart from "./response-time-chart";
import ResponseTimeStats from "./response-time-stats";
import TimePeriodFilter from "./time-period-filter";

export default function MonitorPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");
  const { monitor, checks } = routeApi.useLoaderData();
  const { teamId, monitorId } = routeApi.useParams();
  const search = routeApi.useSearch();
  const { region, period } = search;

  const availableRegions = [...new Set(checks.map((c) => c.location))];
  const showRegionFilter = availableRegions.length > 1;

  const filteredChecks = region
    ? checks.filter((c) => c.location === region)
    : checks;

  const hasNoData = checks.length === 0;

  return (
    <div className="space-y-10 w-full lg:max-w-4xl mx-auto px-4 lg:px-6 pb-20 md:pb-6">
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

      {hasNoData ? (
        <div className="space-y-6">
          <NoDataMessage text="No data collected yet. Checks will start running shortly and results will appear here." />
        </div>
      ) : (
        <>
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

          <MonitorStats filteredChecks={filteredChecks} />

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

          <div className="space-y-4">
            <h3 className="font-medium">Recent Logs</h3>
            <RecentLogsPreview checks={filteredChecks} />
          </div>
        </>
      )}
    </div>
  );
}
