import { Button, buttonVariants } from "@/components/ui/button";
import { getRouteApi, Link } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { useToggleMonitorStatus } from "../api/use-toggle-monitor-status";
import type { MonitorResponse } from "../schemas";
import MonitorConfigSheet from "./monitor-config-sheet";
import RegionFilter from "./region-filter";

export default function MonitorHeader({
  monitor,
  teamId,
  monitorId,
}: {
  monitor: MonitorResponse;
  teamId: string;
  monitorId: string;
}) {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");
  const { checks } = routeApi.useLoaderData();

  const toggleStatus = useToggleMonitorStatus();
  const isPaused = monitor.status === "paused";

  const { region } = routeApi.useSearch();

  const availableRegions = [...new Set(checks.map((c) => c.location))];
  const showRegionFilter = availableRegions.length > 1;

  const handleTogglePause = () => {
    toggleStatus.mutate({
      teamId,
      monitorId,
      status: isPaused ? "initializing" : "paused",
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-start">
        <div className="flex items-center justify-start gap-x-2">
          <h1 className="text-lg font-medium">{monitor.name}</h1>
        </div>
        <h2 className="text-xs text-muted-foreground">
          {monitor.type === "http"
            ? monitor.url
            : `${monitor.host}:${monitor.port}`}
        </h2>
      </div>
      <div className="flex gap-2">
        {showRegionFilter && (
          <RegionFilter
            teamId={teamId}
            monitorId={monitorId}
            currentRegion={region}
            availableRegions={availableRegions}
          />
        )}
        <Button
          variant="outline"
          size={"xs"}
          onClick={handleTogglePause}
          disabled={toggleStatus.isPending}
        >
          {isPaused ? (
            <>
              <Play data-icon="inline-start" className="size-3" />
              Resume
            </>
          ) : (
            <>
              <Pause data-icon="inline-start" className="size-3" />
              Pause
            </>
          )}
        </Button>
        <MonitorConfigSheet monitor={monitor} />
        <Link
          to="/$teamId/monitors/$monitorId/maintenance"
          params={{ teamId, monitorId }}
          className={buttonVariants({ variant: "outline", size: "xs" })}
        >
          Maintenance
        </Link>
      </div>
    </div>
  );
}
