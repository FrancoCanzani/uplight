import { getRouteApi, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

export default function MonitorStatusAlert({
  status,
}: {
  status: "down" | "degraded" | "maintenance";
}) {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");

  const { teamId, monitorId } = routeApi.useParams();

  if (status === "down") {
    return (
      <Card size="xs" className="border-destructive bg-destructive/10 border">
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center justify-start gap-x-1">
            Your monitor is down
          </div>
          <Link
            to="/$teamId/incidents"
            className="hover:underline"
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
      <Card size="xs" className="border-amber-400 bg-amber-500/10 border">
        <CardContent className="flex items-center justify-between">
          <span>Your monitor is degraded</span>
          <Link
            to="/$teamId/monitors/$monitorId"
            className="hover:underline"
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
          <span>Your monitor is in maintenance</span>
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
