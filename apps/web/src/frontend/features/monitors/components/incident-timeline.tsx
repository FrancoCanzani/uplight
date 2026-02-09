import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCause } from "@/lib/utils";
import type { Incident } from "../api/fetch-incidents";

function getIncidentStatusColor(status: string) {
  switch (status) {
    case "resolved":
      return "text-green-700 bg-green-50";
    case "investigating":
      return "text-yellow-700 bg-yellow-50";
    case "identified":
      return "text-orange-700 bg-orange-50";
    case "monitoring":
      return "text-blue-700 bg-blue-50";
    default:
      return "text-gray-700 bg-gray-50";
  }
}

function getIncidentIcon(status: string) {
  switch (status) {
    case "resolved":
      return <CheckCircle className="h-4 w-4" />;
    case "investigating":
    case "identified":
    case "monitoring":
      return <Clock className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
}

function formatDuration(startedAt: number, resolvedAt: number | null): string {
  if (!resolvedAt) {
    return `Started ${formatDistanceToNow(startedAt, { addSuffix: true })}`;
  }

  const durationMs = resolvedAt - startedAt;
  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

export default function IncidentTimeline({
  incidents,
}: {
  incidents: Incident[];
}) {
  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const recentIncidents = incidents.slice(0, 5);

  if (incidents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {activeIncidents.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {activeIncidents.length === 1
              ? "Active Incident"
              : `${activeIncidents.length} Active Incidents`}
          </AlertTitle>
          <AlertDescription>
            {activeIncidents.map((incident) => (
              <div key={incident.id} className="mt-2">
                <span className="font-medium">
                  {incident.title || formatCause(incident.cause)}
                </span>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>Last {recentIncidents.length} incidents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentIncidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card"
            >
              <div
                className={`mt-0.5 ${getIncidentStatusColor(incident.status)}`}
              >
                {getIncidentIcon(incident.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {incident.title || formatCause(incident.cause)}
                    </p>
                    {incident.title && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatCause(incident.cause)}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={getIncidentStatusColor(incident.status)}
                  >
                    {incident.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>
                    {formatDuration(incident.startedAt, incident.resolvedAt)}
                  </span>
                  {incident.resolvedAt && (
                    <span>
                      • Resolved{" "}
                      {formatDistanceToNow(incident.resolvedAt, {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
