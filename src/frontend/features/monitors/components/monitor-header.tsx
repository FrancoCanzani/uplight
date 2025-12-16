import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRouteApi, Link } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { useToggleMonitorStatus } from "../api/use-toggle-monitor-status";
import type { MonitorResponse } from "../schemas";
import getStatusColor from "../utils/get-status-color";
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
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-medium">{monitor.name}</h1>
        <Badge className={cn("capitalize", getStatusColor(monitor.status))}>
          {monitor.status}
        </Badge>
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
          className={buttonVariants({ variant: "outline" })}
        >
          Maintenance
        </Link>
      </div>
    </div>
  );
}
