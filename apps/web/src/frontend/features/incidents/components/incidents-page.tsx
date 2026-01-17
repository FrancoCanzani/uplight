import { useMemo, useState } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { Activity, ChevronDown, ChevronRight, Heart } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatCause, formatDuration } from "@lib/utils";
import type { Incident, IncidentStatus } from "../types";
import { calculateIncidentStats } from "../utils/calculate-stats";

const STATUS_ORDER: IncidentStatus[] = [
  "ongoing",
  "acknowledged",
  "fixing",
  "recovered",
  "resolved",
];

export default function IncidentsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/");
  const { incidents } = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();
  const navigate = useNavigate();

  const [hideResolved, setHideResolved] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<IncidentStatus>>(
    new Set(STATUS_ORDER),
  );
  const [typeFilter, setTypeFilter] = useState<"all" | "monitor" | "heartbeat">(
    "all",
  );

  const stats = useMemo(() => calculateIncidentStats(incidents), [incidents]);

  const typeCounts = useMemo(() => {
    const monitor = incidents.filter(
      (i: Incident) => i.type === "monitor",
    ).length;
    const heartbeat = incidents.filter(
      (i: Incident) => i.type === "heartbeat",
    ).length;
    return { monitor, heartbeat };
  }, [incidents]);

  const groups = useMemo(() => {
    const grouped: Partial<Record<IncidentStatus, Incident[]>> = {
      ongoing: [],
      acknowledged: [],
      fixing: [],
      recovered: [],
      resolved: [],
    };

    const filteredIncidents =
      typeFilter === "all"
        ? incidents
        : incidents.filter((i: Incident) => i.type === typeFilter);

    filteredIncidents.forEach((incident: Incident) => {
      if (grouped[incident.status]) {
        grouped[incident.status]!.push(incident);
      }
    });

    const statusOrder = hideResolved
      ? STATUS_ORDER.filter((status) => status !== "resolved")
      : STATUS_ORDER;

    return statusOrder.map((status) => ({
      status,
      incidents: grouped[status] ?? [],
      count: grouped[status]?.length ?? 0,
    }));
  }, [incidents, hideResolved, typeFilter]);

  function toggleGroup(status: IncidentStatus) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }

  function handleIncidentClick(incident: Incident) {
    if (incident.type === "monitor") {
      navigate({
        to: "/$teamId/incidents/$incidentId",
        params: { teamId, incidentId: incident.id.toString() },
      });
    } else {
      navigate({
        to: "/$teamId/heartbeats/$heartbeatId",
        params: { teamId, heartbeatId: incident.monitorId.toString() },
      });
    }
  }

  return (
    <div className="space-y-10 w-full lg:max-w-4xl mx-auto">
      <PageHeader title="Incidents" />
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Open</div>
            <div className="">{stats.openCount}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Resolve Time</div>
            <div className="">
              {stats.resolveTime > 0 ? formatDuration(stats.resolveTime) : "-"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">
              Acknowledge Time
            </div>
            <div className="">
              {stats.acknowledgeTime > 0
                ? formatDuration(stats.acknowledgeTime)
                : "-"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="hide-resolved"
            checked={hideResolved}
            onCheckedChange={(checked) => setHideResolved(checked === true)}
          />
          <label
            htmlFor="hide-resolved"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Hide resolved
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          size="xs"
          onClick={() => setTypeFilter("all")}
        >
          All
        </Button>
        <Button
          variant={typeFilter === "monitor" ? "default" : "outline"}
          size="xs"
          disabled={typeCounts.monitor === 0}
          onClick={() =>
            setTypeFilter(typeFilter === "monitor" ? "all" : "monitor")
          }
        >
          <Activity className="size-3" />
          Monitors
          {typeCounts.monitor > 0 && <span>({typeCounts.monitor})</span>}
        </Button>
        <Button
          variant={typeFilter === "heartbeat" ? "default" : "outline"}
          size="xs"
          disabled={typeCounts.heartbeat === 0}
          onClick={() =>
            setTypeFilter(typeFilter === "heartbeat" ? "all" : "heartbeat")
          }
        >
          <Heart className="size-3" />
          Heartbeats
          {typeCounts.heartbeat > 0 && <span>({typeCounts.heartbeat})</span>}
        </Button>
      </div>

      <div className="space-y-4">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.status);
          return (
            <div key={group.status} className="space-y-2">
              <button
                onClick={() => toggleGroup(group.status)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
                <span className="capitalize">
                  {group.status} ({group.count})
                </span>
              </button>

              {isExpanded && (
                <div className="space-y-0 pl-3 text-sm">
                  {group.incidents.map((incident) => (
                    <div
                      key={`${incident.type}-${incident.id}`}
                      className={cn(
                        "group flex items-center justify-between gap-4 py-1.5 px-2 hover:bg-surface transition-colors border-b border-border/35 last:border-b-0",
                        incident.type === "monitor" && "cursor-pointer",
                      )}
                      onClick={() => handleIncidentClick(incident)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="shrink-0 capitalize">
                          {incident.type}
                        </span>
                        <span>*</span>
                        <span className="shrink-0">{incident.monitorName}</span>
                        <span className="text-muted-foreground truncate">
                          {incident.title ?? formatCause(incident.cause)}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNowStrict(
                          new Date(incident.startedAt),
                          {
                            addSuffix: true,
                          },
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
