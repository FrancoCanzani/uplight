import { Card, CardContent } from "@/components/ui/card";
import { formatCause } from "@lib/utils";
import { getRouteApi, Link } from "@tanstack/react-router";
import { AlertTriangle, Wrench, X } from "lucide-react";

export default function MonitorStatusAlert({
  status,
}: {
  status: "down" | "degraded" | "maintenance";
}) {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");

  const { teamId, monitorId } = routeApi.useParams();
  const { incidents } = routeApi.useLoaderData();

  const latestIncident = incidents;

  if (status === "down") {
    return (
      <Card size="xs" className="border-destructive bg-destructive/10 border">
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center justify-start gap-x-1">
            {latestIncident && (
              <span className="flex font-medium items-center justify-start gap-x-1">
                <X className="text-destructive size-3" />
                {formatCause(latestIncident.cause)}
              </span>
            )}
            {" - "}
            Your monitor is down
          </div>
          <Link
            to="/$teamId/incidents"
            className="text-muted-foreground hover:underline hover:text-primary"
            params={{ teamId: teamId }}
          >
            Manage your incidents
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (status === "degraded") {
    return (
      <Card size="xs" className="border-amber-500 bg-amber-500/10 border">
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center justify-start gap-x-1">
            <AlertTriangle className="text-amber-500 size-3" />
            Your monitor is degraded
          </div>
          <Link
            to="/$teamId/monitors/$monitorId"
            className="text-muted-foreground hover:underline hover:text-primary"
            params={{ teamId: teamId, monitorId: monitorId }}
          >
            View monitor details
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (status === "maintenance") {
    return (
      <Card size="xs" className="border-blue-500 bg-blue-500/10 border">
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center justify-start gap-x-1">
            <Wrench className="text-blue-500 size-3" />
            Your monitor is in maintenance
          </div>
          <Link
            to="/$teamId/monitors/$monitorId/maintenance"
            className="text-muted-foreground hover:underline hover:text-primary"
            params={{ teamId: teamId, monitorId: monitorId }}
          >
            Manage maintenance
          </Link>
        </CardContent>
      </Card>
    );
  }

  return null;
}
