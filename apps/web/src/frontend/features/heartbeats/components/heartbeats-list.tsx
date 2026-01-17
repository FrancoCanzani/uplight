import { useMemo, useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, getStatusBgColor } from "@lib/utils";
import { GRACE_PERIODS } from "../constants";
import type { HeartbeatResponse, RecentPing } from "../schemas";

function formatGracePeriod(seconds: number): string {
  const period = GRACE_PERIODS.find((p) => p.value === seconds);
  return period?.label ?? `${seconds}s`;
}

function PingsVisualization({ pings }: { pings: RecentPing[] }) {
  if (pings.length === 0) {
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

  const displayPings = pings.slice(-100);
  const paddedPings = Array.from({ length: 100 }, (_, i) => {
    const pingIndex = i - (100 - displayPings.length);
    return pingIndex >= 0 ? displayPings[pingIndex] : null;
  });

  return (
    <div className="flex gap-0.5 h-4">
      {paddedPings.map((ping, i) => {
        if (!ping) {
          return (
            <div
              key={i}
              className="flex-1 bg-muted"
              style={{ minWidth: "1px" }}
            />
          );
        }
        return (
          <div
            key={i}
            className="flex-1 bg-green-600"
            style={{ minWidth: "1px" }}
          />
        );
      })}
    </div>
  );
}

function HeartbeatStatusIndicator({ status }: { status: string }) {
  return (
    <Tooltip>
      <TooltipTrigger className="shrink-0">
        <div
          className={cn(
            "size-2 -full flex items-center justify-center",
            getStatusBgColor(status),
          )}
        >
          <div
            className={cn(
              "size-1.5 -full animate-ping",
              getStatusBgColor(status),
            )}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent className="capitalize text-xs">{status}</TooltipContent>
    </Tooltip>
  );
}

type StatusFilter = "up" | "down" | "paused" | "initializing";

const ALL_STATUSES: StatusFilter[] = ["up", "down", "paused", "initializing"];

export default function HeartbeatsList() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/heartbeats/");
  const heartbeats = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  const [nameFilter, setNameFilter] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<Set<StatusFilter>>(
    new Set(ALL_STATUSES),
  );

  const statusCounts = useMemo(() => {
    const up = heartbeats.filter(
      (h: HeartbeatResponse) => h.status === "up",
    ).length;
    const down = heartbeats.filter(
      (h: HeartbeatResponse) => h.status === "down",
    ).length;
    const paused = heartbeats.filter(
      (h: HeartbeatResponse) => h.status === "paused",
    ).length;
    const initializing = heartbeats.filter(
      (h: HeartbeatResponse) => h.status === "initializing",
    ).length;
    return { up, down, paused, initializing };
  }, [heartbeats]);

  const filteredData = useMemo(() => {
    let filtered = heartbeats as HeartbeatResponse[];

    if (selectedStatuses.size < ALL_STATUSES.length) {
      filtered = filtered.filter((hb) =>
        selectedStatuses.has(hb.status as StatusFilter),
      );
    }

    if (nameFilter) {
      filtered = filtered.filter((hb) =>
        hb.name.toLowerCase().includes(nameFilter.toLowerCase()),
      );
    }

    return filtered;
  }, [heartbeats, selectedStatuses, nameFilter]);

  const toggleStatus = (status: StatusFilter) => {
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
                <Filter className="size-3" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground -full size-4 text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.has("up")}
              onCheckedChange={() => toggleStatus("up")}
            >
              <div className="flex items-center gap-2">
                <div className="size-2 -full bg-green-600" />
                Up ({statusCounts.up})
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.has("down")}
              onCheckedChange={() => toggleStatus("down")}
            >
              <div className="flex items-center gap-2">
                <div className="size-2 -full bg-red-600" />
                Down ({statusCounts.down})
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.has("paused")}
              onCheckedChange={() => toggleStatus("paused")}
            >
              <div className="flex items-center gap-2">
                <div className="size-2 -full bg-zinc-400" />
                PauseIcond ({statusCounts.paused})
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.has("initializing")}
              onCheckedChange={() => toggleStatus("initializing")}
            >
              <div className="flex items-center gap-2">
                <div className="size-2 -full bg-amber-500" />
                Initializing ({statusCounts.initializing})
              </div>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          placeholder="Search by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="h-7 max-w-xs bg-background"
        />
      </div>

      <div className="gap-3 flex flex-col">
        {filteredData.length > 0 ? (
          filteredData.map((hb) => {
            const pingCount = hb.recentPings?.length ?? 0;

            return (
              <Link
                key={hb.id}
                to="/$teamId/heartbeats/$heartbeatId"
                params={{
                  teamId,
                  heartbeatId: hb.id.toString(),
                }}
                className="border border-border/50  p-3 hover:bg-surface space-y-2.5 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 justify-start">
                    <HeartbeatStatusIndicator status={hb.status} />
                    <h2>{hb.name}</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Grace: {formatGracePeriod(hb.gracePeriod)}
                  </span>
                </div>

                <div>
                  <PingsVisualization pings={hb.recentPings ?? []} />
                </div>

                <div className="text-xs flex items-center justify-between  text-muted-foreground">
                  {`${pingCount} successful ping${pingCount !== 1 ? "s" : ""}`}
                  {hb.incidentCount > 0 && (
                    <span className="text-red-600">
                      {hb.incidentCount} incident
                      {hb.incidentCount !== 1 ? "s" : ""}
                    </span>
                  )}

                  {hb.lastPingAt && (
                    <span className="text-xs tracking-tighter text-muted-foreground ">
                      Last ping{" "}
                      {formatDistanceToNowStrict(hb.lastPingAt, {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-12 border border-dashed border-border ">
            <p className="text-muted-foreground mb-2">No heartbeats found.</p>
            <p className="text-sm text-muted-foreground">
              Create a heartbeat to monitor your cron jobs and background tasks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
