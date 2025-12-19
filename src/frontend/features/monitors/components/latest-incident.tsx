import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDuration, formatCause } from "@lib/utils";
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import type { Incident } from "../api/fetch-incidents";

interface LatestIncidentProps {
  incident: Incident | null;
  teamId: string;
  monitorId: string;
}

export default function LatestIncident({
  incident,
  teamId,
  monitorId,
}: LatestIncidentProps) {
  const duration = incident
    ? incident.resolvedAt
      ? incident.resolvedAt - incident.startedAt
      : new Date().getTime() - incident.startedAt
    : 0;

  if (!incident) {
    return (
      <div className="rounded-lg border border-dashed p-6">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="size-5 text-emerald-500" />
          <h3 className="font-medium">No Incidents</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          This monitor has no recorded incidents. Keep up the good work!
        </p>
      </div>
    );
  }

  const isOngoing = incident.status === "ongoing";

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle
            className={`size-5 ${isOngoing ? "text-destructive" : "text-muted-foreground"}`}
          />
          <h3 className="font-medium">Latest Incident</h3>
        </div>
        <Badge variant={isOngoing ? "destructive" : "secondary"}>
          {isOngoing ? "Ongoing" : "Resolved"}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Cause</span>
          <span className="font-medium">{formatCause(incident.cause)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Duration
          </span>
          <span className="font-medium tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Started</span>
          <span className="tabular-nums">{formatDate(incident.startedAt)}</span>
        </div>
        {incident.resolvedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Resolved</span>
            <span className="tabular-nums">
              {formatDate(incident.resolvedAt)}
            </span>
          </div>
        )}
      </div>

      <Link
        to="/$teamId/incidents"
        params={{ teamId }}
        search={{ monitorId }}
        className="flex items-center gap-1 text-sm text-primary hover:underline pt-2"
      >
        View all incidents
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
