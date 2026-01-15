import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@lib/utils";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { RecentCheck } from "../schemas";
import MonitorStatusIndicator from "./monitor-status-indicator";

function ChecksVisualization({ checks }: { checks: RecentCheck[] | null }) {
  if (!checks || checks.length === 0) {
    return (
      <div className="flex gap-0.5 h-2 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-muted"
            style={{ minWidth: "2px" }}
          />
        ))}
      </div>
    );
  }

  // Take last 100 checks, or pad if less than 100
  const displayChecks = checks.slice(-100);
  const paddedChecks = Array.from({ length: 100 }, (_, i) => {
    const checkIndex = i - (100 - displayChecks.length);
    return checkIndex >= 0 ? displayChecks[checkIndex] : null;
  });

  return (
    <div className="flex gap-0.5 h-4">
      {paddedChecks.map((check, i) => {
        if (!check) {
          return (
            <div
              key={i}
              className="flex-1 bg-muted"
              style={{ minWidth: "1px" }}
            />
          );
        }
        const isSuccess =
          check.result === "success" || check.result === "maintenance";
        return (
          <div
            key={i}
            className={cn("flex-1", isSuccess ? "bg-green-700" : "bg-red-700")}
            style={{ minWidth: "1px" }}
          />
        );
      })}
    </div>
  );
}

export default function MonitorsList() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/");
  const monitors = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "up" | "down" | "degraded" | "all"
  >("all");

  const statusCounts = useMemo(() => {
    const up = monitors.filter((m) => m.status === "up").length;
    const down = monitors.filter((m) => m.status === "down").length;
    const degraded = monitors.filter((m) => m.status === "degraded").length;
    return { up, down, degraded };
  }, [monitors]);

  const filteredData = useMemo(() => {
    let filtered = monitors;

    if (statusFilter !== "all") {
      filtered = filtered.filter((monitor) => {
        if (statusFilter === "up") {
          return monitor.status === "up";
        }
        if (statusFilter === "down") {
          return monitor.status === "down";
        }
        if (statusFilter === "degraded") {
          return monitor.status === "degraded";
        }
        return true;
      });
    }

    if (nameFilter) {
      filtered = filtered.filter((monitor) =>
        monitor.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    return filtered;
  }, [monitors, statusFilter, nameFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === "up" ? "default" : "outline"}
            size="xs"
            disabled={statusCounts.up === 0}
            onClick={() =>
              setStatusFilter(statusFilter === "up" ? "all" : "up")
            }
          >
            <div className="bg-green-700 size-2 rounded-full" />
            Up
            {statusCounts.up > 0 && <span>({statusCounts.up})</span>}
          </Button>
          <Button
            variant={statusFilter === "down" ? "default" : "outline"}
            size="xs"
            disabled={statusCounts.down === 0}
            onClick={() =>
              setStatusFilter(statusFilter === "down" ? "all" : "down")
            }
          >
            <div className="bg-red-700 size-2 rounded-full" />
            Down
            {statusCounts.down > 0 && <span>({statusCounts.down})</span>}
          </Button>
          <Button
            variant={statusFilter === "degraded" ? "default" : "outline"}
            size="xs"
            disabled={statusCounts.degraded === 0}
            onClick={() =>
              setStatusFilter(statusFilter === "degraded" ? "all" : "degraded")
            }
          >
            <div className="bg-orange-700 size-2 rounded-full" />
            Degraded
            {statusCounts.degraded > 0 && (
              <span>({statusCounts.degraded})</span>
            )}
          </Button>
        </div>
        <Input
          placeholder="Search by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="h-7 max-w-xs bg-background"
        />
      </div>

      <div className="gap-3 flex flex-col">
        {filteredData.length > 0 ? (
          filteredData.map((monitor) => {
            const urlOrHost =
              monitor.type === "http"
                ? monitor.url
                : `${monitor.host}:${monitor.port}`;

            const checks = monitor.recentChecks || [];
            const successfulCount = checks.filter(
              (c) => c.result === "success" || c.result === "maintenance"
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
                className="border border-border/50 rounded p-3 hover:bg-surface space-y-2.5 transition-colors cursor-pointer"
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

                <div className="text-xs flex items-center justify-between font-mono text-muted-foreground">
                  {`${successfulCount}/${totalCount} successful checks`}

                  {monitor.lastCheckAt && (
                    <span className="text-xs tracking-tighter text-muted-foreground font-mono">
                      Last check {formatDate(monitor.lastCheckAt)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No monitors found.
          </div>
        )}
      </div>
    </div>
  );
}
