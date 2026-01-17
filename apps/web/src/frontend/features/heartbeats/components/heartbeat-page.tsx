import { useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Copy, Pause, Pencil, Play, Trash } from "lucide-react";
import { toast } from "sonner";
import AnimatedNumber from "@/components/motion/animated-number";
import { PageHeader } from "@/components/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteHeartbeat } from "../api/use-delete-heartbeat";
import { useToggleHeartbeatStatus } from "../api/use-toggle-heartbeat-status";
import { formatGracePeriod } from "../utils/format-grace-period";

export default function HeartbeatPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/heartbeats/$heartbeatId/");
  const heartbeat = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  const deleteHeartbeat = useDeleteHeartbeat();
  const toggleStatus = useToggleHeartbeatStatus();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const pingUrl = `${window.location.origin}${heartbeat.pingUrl}`;

  const copyPingUrl = () => {
    navigator.clipboard.writeText(pingUrl);
    toast.success("Ping URL copied to clipboard");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const isDeleteEnabled = deleteConfirmation === heartbeat.name;

  const handleDelete = () => {
    if (isDeleteEnabled) {
      deleteHeartbeat.mutate(
        {
          teamId: Number(teamId),
          heartbeatId: heartbeat.id,
          name: heartbeat.name,
        },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setDeleteConfirmation("");
          },
        },
      );
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

  const pingCount = heartbeat.recentPings.length;
  const lastPingTime = heartbeat.lastPingAt
    ? formatDistanceToNowStrict(heartbeat.lastPingAt, { addSuffix: true })
    : "Never";

  return (
    <div className="space-y-10 w-full lg:max-w-4xl mx-auto">
      <PageHeader
        title={heartbeat.name}
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
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash className="size-3" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="xs">
          <CardHeader>
            <CardDescription>Status</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <span className="capitalize text-xs">{heartbeat.status}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="xs">
          <CardHeader>
            <CardDescription>Total Pings</CardDescription>
            <CardTitle className="text-lg">
              <AnimatedNumber value={pingCount} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="xs">
          <CardHeader>
            <CardDescription>Last Ping</CardDescription>
            <CardTitle className="text-sm">{lastPingTime}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="xs">
          <CardHeader>
            <CardDescription>Grace Period</CardDescription>
            <CardTitle className="text-sm">
              {formatGracePeriod(heartbeat.gracePeriod)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Ping URL</h3>
          <p className="text-xs text-muted-foreground">
            Send a GET request to this URL from your cron job, scheduled task,
            or background worker to report that it's running.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <code className="flex-1 bg-surface px-2 py-1.5 text-xs h-7 break-all">
              {pingUrl}
            </code>
            <button onClick={copyPingUrl}>
              <Copy className="size-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Usage Examples</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">curl</p>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => copyCode(`curl -fsS ${pingUrl}`)}
              >
                <Copy className="size-3" />
              </Button>
            </div>
            <code className="block bg-surface px-3 py-2 text-xs break-all">
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
                  copyCode(
                    `0 * * * * /path/to/script.sh && curl -fsS ${pingUrl}`,
                  )
                }
              >
                <Copy className="size-2.5" />
              </Button>
            </div>
            <code className="block bg-surface  px-3 py-2 text-xs  break-all">
              0 * * * * /path/to/script.sh && curl -fsS {pingUrl}
            </code>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">
                Node.js / JavaScript
              </p>
              <Button
                variant="ghost"
                size="xs"
                className="h-5 px-1.5"
                onClick={() => copyCode(nodeExample)}
              >
                <Copy className="size-2.5" />
              </Button>
            </div>
            <code className="block bg-surface  px-3 py-2 text-xs  break-all">
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
            <code className="block bg-surface  px-3 py-2 text-xs  whitespace-pre break-all">
              {pythonExample}
            </code>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Recent Pings</h3>

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
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Method</th>
                  <th className="py-2 pr-4 font-medium">IP Address</th>
                  <th className="py-2 pr-4 font-medium">User Agent</th>
                  <th className="py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {heartbeat.recentPings.map((ping) => {
                  const pingDate = new Date(ping.pingedAt);
                  return (
                    <tr
                      key={ping.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 pr-4 text-xs">OK</td>
                      <td className="py-2.5 pr-4 text-xs">{ping.method}</td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                        {ping.ip || "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground max-w-50 truncate">
                        {ping.userAgent || "—"}
                      </td>
                      <td className="py-2.5 text-xs tabular-nums tracking-tight">
                        <time dateTime={new Date(ping.pingedAt).toISOString()}>
                          {format(pingDate, "MMM d, h:mm a")}
                        </time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Heartbeat</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              heartbeat and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              To confirm, please type the heartbeat name:{" "}
              <strong>{heartbeat.name}</strong>
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder={heartbeat.name}
              className=" text-xs"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              size={"xs"}
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size={"xs"}
              onClick={handleDelete}
              disabled={!isDeleteEnabled || deleteHeartbeat.isPending}
              variant="destructive"
            >
              {deleteHeartbeat.isPending ? "Deleting..." : "Delete Heartbeat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
