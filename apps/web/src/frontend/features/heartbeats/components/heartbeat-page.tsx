import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@lib/utils";
import { Link, getRouteApi } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { Copy, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteHeartbeat } from "../api/use-delete-heartbeat";
import { useToggleHeartbeatStatus } from "../api/use-toggle-heartbeat-status";
import { GRACE_PERIODS } from "../constants";

function getStatusColor(status: string): string {
  switch (status) {
    case "up":
      return "text-emerald-600";
    case "down":
      return "text-red-600";
    case "paused":
      return "text-muted-foreground";
    case "initializing":
      return "text-amber-600";
    default:
      return "text-muted-foreground";
  }
}

function formatGracePeriod(seconds: number): string {
  const period = GRACE_PERIODS.find((p) => p.value === seconds);
  return period?.label ?? `${seconds}s`;
}

export default function HeartbeatPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/heartbeats/$heartbeatId/");
  const heartbeat = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  const deleteHeartbeat = useDeleteHeartbeat();
  const toggleStatus = useToggleHeartbeatStatus();

  const pingUrl = `${window.location.origin}${heartbeat.pingUrl}`;

  const copyPingUrl = () => {
    navigator.clipboard.writeText(pingUrl);
    toast.success("Ping URL copied to clipboard");
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${heartbeat.name}"?`)) {
      deleteHeartbeat.mutate({
        teamId: Number(teamId),
        heartbeatId: heartbeat.id,
        name: heartbeat.name,
      });
    }
  };

  const handleToggleStatus = () => {
    const newStatus = heartbeat.status === "paused" ? "initializing" : "paused";
    toggleStatus.mutate({
      teamId: Number(teamId),
      heartbeatId: heartbeat.id,
      status: newStatus,
      name: heartbeat.name,
    });
  };

  return (
    <div className="space-y-8 w-full lg:max-w-4xl mx-auto">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl tracking-tight">{heartbeat.name}</h1>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("capitalize", getStatusColor(heartbeat.status))}
            >
              {heartbeat.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Grace period: {formatGracePeriod(heartbeat.gracePeriod)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            render={
              <Link
                to="/$teamId/heartbeats/$heartbeatId/edit"
                params={{ teamId, heartbeatId: String(heartbeat.id) }}
              >
                <Pencil className="size-3" />
                Edit
              </Link>
            }
          />
          <Button
            variant="outline"
            size="xs"
            onClick={handleToggleStatus}
            disabled={toggleStatus.isPending}
          >
            {heartbeat.status === "paused" ? (
              <>
                <Play className="size-3" />
                Resume
              </>
            ) : (
              <>
                <Pause className="size-3" />
                Pause
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="xs"
            onClick={handleDelete}
            disabled={deleteHeartbeat.isPending}
          >
            <Trash2 className="size-3" />
            Delete
          </Button>
        </div>
      </header>

      <div className="space-y-4 bg-surface rounded p-4">
        <div>
          <h2 className="text-sm font-medium mb-2">Ping URL</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Send a GET request to this URL from your cron job, scheduled task,
            or background worker to report that it's running.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background rounded px-3 py-2 text-xs font-mono break-all">
              {pingUrl}
            </code>
            <Button variant="outline" size="xs" onClick={copyPingUrl}>
              <Copy className="size-3" />
              Copy
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="text-sm font-medium mb-2">Usage Examples</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">curl</p>
              <code className="block bg-background rounded px-3 py-2 text-xs font-mono break-all">
                curl -fsS {pingUrl}
              </code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Cron job (after your script)
              </p>
              <code className="block bg-background rounded px-3 py-2 text-xs font-mono break-all">
                0 * * * * /path/to/script.sh && curl -fsS {pingUrl}
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-surface rounded p-4">
        <h2 className="text-sm font-medium">Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Last Ping</p>
            <p className="text-sm font-mono">
              {heartbeat.lastPingAt
                ? formatDistanceToNowStrict(heartbeat.lastPingAt, {
                    addSuffix: true,
                  })
                : "Never"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm font-mono">
              {formatDistanceToNowStrict(new Date(heartbeat.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
