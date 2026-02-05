import { useMemo, useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { Funnel } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  cn,
  formatDate,
  getStatusBgColor,
  type MonitorStatus,
} from "@lib/utils";
import type { MonitorResponse } from "../schemas";
import ChecksVisualization from "./checks-visualization";
import MonitorStatusIndicator from "./monitor-status-indicator";
import MonitorsTable from "./monitors-table";

const ALL_STATUSES: MonitorStatus[] = [
  "up",
  "down",
  "degraded",
  "maintenance",
  "paused",
  "initializing",
];

export default function MonitorsList() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/");
  const monitors = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  const [nameFilter, setNameFilter] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<Set<MonitorStatus>>(
    new Set(ALL_STATUSES),
  );

  const statusCounts = useMemo(() => {
    const counts: Record<MonitorStatus, number> = {
      up: 0,
      down: 0,
      degraded: 0,
      maintenance: 0,
      paused: 0,
      initializing: 0,
    };
    monitors.forEach((m: MonitorResponse) => {
      if (counts[m.status as MonitorStatus] !== undefined) {
        counts[m.status as MonitorStatus]++;
      }
    });
    return counts;
  }, [monitors]);

  const filteredData = useMemo(() => {
    let filtered = monitors as MonitorResponse[];

    if (selectedStatuses.size < ALL_STATUSES.length) {
      filtered = filtered.filter((m) =>
        selectedStatuses.has(m.status as MonitorStatus),
      );
    }

    if (nameFilter) {
      filtered = filtered.filter((monitor) =>
        monitor.name.toLowerCase().includes(nameFilter.toLowerCase()),
      );
    }

    return filtered;
  }, [monitors, selectedStatuses, nameFilter]);

  const toggleStatus = (status: MonitorStatus) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        if (next.size > 1) {
          next.delete(status);
        }
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const activeFilterCount =
    ALL_STATUSES.length - selectedStatuses.size > 0
      ? ALL_STATUSES.length - selectedStatuses.size
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="xs">
                <Funnel className="size-3" />
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground -full size-4 text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-fit">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
            </DropdownMenuGroup>
            {statusCounts.up > 0 && (
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.has("up")}
                onCheckedChange={() => toggleStatus("up")}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("size-2 -full", getStatusBgColor("up"))} />
                  Up ({statusCounts.up})
                </div>
              </DropdownMenuCheckboxItem>
            )}
            {statusCounts.down > 0 && (
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.has("down")}
                onCheckedChange={() => toggleStatus("down")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn("size-2 -full", getStatusBgColor("down"))}
                  />
                  Down ({statusCounts.down})
                </div>
              </DropdownMenuCheckboxItem>
            )}
            {statusCounts.degraded > 0 && (
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.has("degraded")}
                onCheckedChange={() => toggleStatus("degraded")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn("size-2 -full", getStatusBgColor("degraded"))}
                  />
                  Degraded ({statusCounts.degraded})
                </div>
              </DropdownMenuCheckboxItem>
            )}
            {statusCounts.maintenance > 0 && (
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.has("maintenance")}
                onCheckedChange={() => toggleStatus("maintenance")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "size-2 -full",
                      getStatusBgColor("maintenance"),
                    )}
                  />
                  Maintenance ({statusCounts.maintenance})
                </div>
              </DropdownMenuCheckboxItem>
            )}
            {statusCounts.paused > 0 && (
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.has("paused")}
                onCheckedChange={() => toggleStatus("paused")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn("size-2 -full", getStatusBgColor("paused"))}
                  />
                  Paused ({statusCounts.paused})
                </div>
              </DropdownMenuCheckboxItem>
            )}
            {statusCounts.initializing > 0 && (
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.has("initializing")}
                onCheckedChange={() => toggleStatus("initializing")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "size-2 -full",
                      getStatusBgColor("initializing"),
                    )}
                  />
                  Initializing ({statusCounts.initializing})
                </div>
              </DropdownMenuCheckboxItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          placeholder="SearchIcon by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="h-7 max-w-xs"
        />
      </div>

      <div className="hidden md:block">
        <MonitorsTable monitors={filteredData} teamId={teamId} />
      </div>

      <div className="gap-3 flex flex-col md:hidden">
        {filteredData.length > 0 ? (
          filteredData.map((monitor) => {
            const urlOrHost =
              monitor.type === "http"
                ? monitor.url
                : `${monitor.host}:${monitor.port}`;

            const checks = monitor.recentChecks || [];
            const successfulCount = checks.filter(
              (c) => c.result === "success" || c.result === "maintenance",
            ).length;
            const totalCount = checks.length;

            return (
              <Link
                key={monitor.id}
                to="/$teamId/monitors/$monitorId"
                params={{
                  teamId,
                  monitorId: monitor.id.toString(),
                }}
                className="border border-border/30 p-3 hover:bg-surface space-y-2.5 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 justify-start">
                    <MonitorStatusIndicator status={monitor.status} />
                    <h2>{monitor.name}</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {urlOrHost}
                  </span>
                </div>

                <div>
                  <ChecksVisualization checks={monitor.recentChecks} />
                </div>

                <div className="text-xs flex items-center justify-between  text-muted-foreground">
                  {`${successfulCount}/${totalCount} successful checks`}

                  {monitor.lastCheckAt && (
                    <span className="text-xs tracking-tighter text-muted-foreground ">
                      Last check {formatDate(monitor.lastCheckAt)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-12 border border-dashed border-border ">
            <p className="text-muted-foreground mb-2">No monitors found.</p>
            <p className="text-sm text-muted-foreground">
              Create a monitor to start tracking uptime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
