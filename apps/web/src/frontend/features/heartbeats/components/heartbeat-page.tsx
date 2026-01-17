import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, getStatusBgColor, getStatusTextColor } from "@lib/utils";
import { Link, getRouteApi } from "@tanstack/react-router";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Copy, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteHeartbeat } from "../api/use-delete-heartbeat";
import { useToggleHeartbeatStatus } from "../api/use-toggle-heartbeat-status";
import { GRACE_PERIODS, PERIODS } from "../constants";

function formatGracePeriod(seconds: number): string {
  const period = GRACE_PERIODS.find((p) => p.value === seconds);
  return period?.label ?? `${seconds}s`;
}

function formatPeriod(seconds: number): string {
  const period = PERIODS.find((p) => p.value === seconds);
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

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
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

  const nodeExample = `fetch("${pingUrl}").catch(console.error);`;
  const pythonExample = `import requests\nrequests.get("${pingUrl}")`;

  return (
    <div className="space-y-8 w-full lg:max-w-4xl mx-auto">
      <PageHeader
        title={heartbeat.name}
        subtitle={`Expected every ${formatPeriod(heartbeat.period)} · Grace: ${formatGracePeriod(heartbeat.gracePeriod)}`}
        backLink={{ to: "/$teamId/heartbeats", params: { teamId } }}
        actions={
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
        }
      />

      <div className="space-y-4 bg-surface rounded p-4">
        <h2 className="text-sm font-medium">Status</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Status</p>
            <div className="flex items-center gap-2">
              <div
                className={cn("size-2.5 rounded-full", getStatusBgColor(heartbeat.status))}
              />
              <p className={cn("text-sm font-medium capitalize", getStatusTextColor(heartbeat.status))}>
                {heartbeat.status}
              </p>
            </div>
          </div>
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
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">curl</p>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-5 px-1.5"
                  onClick={() => copyCode(`curl -fsS ${pingUrl}`)}
                >
                  <Copy className="size-2.5" />
                </Button>
              </div>
              <code className="block bg-background rounded px-3 py-2 text-xs font-mono break-all">
                curl -fsS {pingUrl}
              </code>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">
                  Cron job (after your script)
                </p>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-5 px-1.5"
                  onClick={() =>
                    copyCode(`0 * * * * /path/to/script.sh && curl -fsS ${pingUrl}`)
                  }
                >
                  <Copy className="size-2.5" />
                </Button>
              </div>
              <code className="block bg-background rounded px-3 py-2 text-xs font-mono break-all">
                0 * * * * /path/to/script.sh && curl -fsS {pingUrl}
              </code>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Node.js / JavaScript</p>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-5 px-1.5"
                  onClick={() => copyCode(nodeExample)}
                >
                  <Copy className="size-2.5" />
                </Button>
              </div>
              <code className="block bg-background rounded px-3 py-2 text-xs font-mono break-all">
                {nodeExample}
              </code>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Python</p>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-5 px-1.5"
                  onClick={() => copyCode(pythonExample)}
                >
                  <Copy className="size-2.5" />
                </Button>
              </div>
              <code className="block bg-background rounded px-3 py-2 text-xs font-mono whitespace-pre break-all">
                {pythonExample}
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-surface rounded p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent Pings</h2>
          <span className="text-xs text-muted-foreground">
            {heartbeat.recentPings.length} events
          </span>
        </div>

        {heartbeat.recentPings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No pings recorded yet. Send your first ping to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4 font-medium">ID</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Request</th>
                  <th className="py-2 font-medium">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {heartbeat.recentPings.map((ping) => {
                  const pingDate = new Date(ping.pingedAt);
                  return (
                    <tr key={ping.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">
                        #{ping.id}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs">
                        {format(pingDate, "MMM dd")}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs">
                        {format(pingDate, "HH:mm:ss")}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="success" className="text-[10px] px-1.5 py-0">
                          OK
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-xs">
                        <span className="font-mono">{ping.method}</span>
                        {ping.ip && (
                          <span className="text-muted-foreground ml-1.5">
                            from {ping.ip}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">
                        {ping.userAgent || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
