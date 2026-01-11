import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCause, formatDuration } from "@lib/utils";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useUpdateIncidentStatus } from "../api/use-update-incident-status";
import type { Incident, IncidentStatus } from "../types";
import { calculateIncidentStats } from "../utils/calculate-stats";

const STATUS_ORDER: IncidentStatus[] = [
  "ongoing",
  "acknowledged",
  "fixing",
  "resolved",
];

const STATUS_LABELS: Record<IncidentStatus, string> = {
  ongoing: "Ongoing",
  acknowledged: "Acknowledged",
  fixing: "Fixing",
  resolved: "Resolved",
};

export default function IncidentsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/");
  const { incidents } = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();
  const navigate = useNavigate();
  const updateStatus = useUpdateIncidentStatus();

  const [hideResolved, setHideResolved] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<IncidentStatus>>(
    new Set(STATUS_ORDER),
  );

  const stats = useMemo(() => calculateIncidentStats(incidents), [incidents]);

  const groups = useMemo(() => {
    const grouped: Partial<Record<IncidentStatus, Incident[]>> = {
      ongoing: [],
      acknowledged: [],
      fixing: [],
      resolved: [],
    };

    incidents.forEach((incident: Incident) => {
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
  }, [incidents, hideResolved]);

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

  function handleStatusChange(incidentId: number, newStatus: IncidentStatus) {
    updateStatus.mutate({
      teamId: Number(teamId),
      incidentId,
      status: newStatus as "ongoing" | "acknowledged" | "fixing" | "resolved",
    });
  }

  function handleIncidentClick(incidentId: number) {
    navigate({
      to: "/$teamId/incidents/$incidentId",
      params: { teamId, incidentId: incidentId.toString() },
    });
  }

  return (
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Open</div>
            <div className="font-medium">{stats.openCount}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Resolve Time</div>
            <div className="font-medium">
              {stats.resolveTime > 0 ? formatDuration(stats.resolveTime) : "-"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">
              Acknowledge Time
            </div>
            <div className="font-medium">
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
                <span>
                  {STATUS_LABELS[group.status]} ({group.count})
                </span>
              </button>

              {isExpanded && (
                <div className="space-y-0 pl-3 text-sm">
                  {group.incidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="group flex items-center justify-between gap-4 py-1.5 px-2 hover:bg-surface cursor-pointer transition-colors border-b border-border/35 last:border-b-0"
                      onClick={() => handleIncidentClick(incident.id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium shrink-0">
                          {incident.id}
                        </span>
                        <span className="shrink-0">{incident.monitorName}</span>
                        <span className="text-muted-foreground truncate">
                          {incident.title ?? formatCause(incident.cause)}
                        </span>
                      </div>

                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatDistanceToNowStrict(
                            new Date(incident.startedAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="xs">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {STATUS_ORDER.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(incident.id, status);
                                }}
                                disabled={incident.status === status}
                                className="text-xs"
                              >
                                {STATUS_LABELS[status]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
