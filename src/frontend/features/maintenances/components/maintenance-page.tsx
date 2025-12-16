import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import fetchMaintenance from "../api/fetch-maintenance";
import { useCreateMaintenance } from "../api/use-create-maintenance";
import { useUpdateMaintenance } from "../api/use-update-maintenance";
import { useDeleteMaintenance } from "../api/use-delete-maintenance";
import type { Maintenance } from "../schemas";

function MaintenanceForm({
  monitorId,
  teamId,
  existing,
  onClose,
}: {
  monitorId: number;
  teamId: string;
  existing?: Maintenance;
  onClose?: () => void;
}) {
  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();

  const now = new Date();
  const defaultStart = existing
    ? new Date(existing.startsAt)
    : now;
  const defaultEnd = existing
    ? new Date(existing.endsAt)
    : new Date(now.getTime() + 60 * 60 * 1000);

  const [reason, setReason] = useState(existing?.reason ?? "");
  const [startsAt, setStartsAt] = useState(
    format(defaultStart, "yyyy-MM-dd'T'HH:mm")
  );
  const [endsAt, setEndsAt] = useState(
    format(defaultEnd, "yyyy-MM-dd'T'HH:mm")
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      monitorId,
      reason: reason || undefined,
      startsAt: new Date(startsAt).getTime(),
      endsAt: new Date(endsAt).getTime(),
    };

    if (existing) {
      updateMutation.mutate(
        {
          teamId,
          maintenanceId: existing.id,
          monitorId,
          data: {
            reason: reason || undefined,
            startsAt: new Date(startsAt).getTime(),
            endsAt: new Date(endsAt).getTime(),
          },
        },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate({ teamId, data }, { onSuccess: onClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div>
        <Label htmlFor="reason">Reason (optional)</Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Scheduled server maintenance"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startsAt">Starts at</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="endsAt">Ends at</Label>
          <Input
            id="endsAt"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {existing ? "Update" : "Schedule"} Maintenance
        </Button>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function MaintenanceItem({
  item,
  teamId,
  monitorId,
}: {
  item: Maintenance;
  teamId: string;
  monitorId: number;
}) {
  const [editing, setEditing] = useState(false);
  const deleteMutation = useDeleteMaintenance();

  const now = Date.now();
  const isActive = item.startsAt <= now && item.endsAt > now;
  const isPast = item.endsAt <= now;
  const isFuture = item.startsAt > now;

  if (editing) {
    return (
      <MaintenanceItem item={item} teamId={teamId} monitorId={monitorId} />
    );
  }

  return (
    <div className={`p-4 border rounded-lg ${isActive ? "border-blue-500 bg-blue-50" : ""}`}>
      {editing ? (
        <MaintenanceForm
          monitorId={monitorId}
          teamId={teamId}
          existing={item}
          onClose={() => setEditing(false)}
        />
      ) : (
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {format(new Date(item.startsAt), "MMM d, yyyy HH:mm")}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium">
                {format(new Date(item.endsAt), "MMM d, yyyy HH:mm")}
              </span>
              {isActive && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                  Active
                </span>
              )}
              {isPast && (
                <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded">
                  Completed
                </span>
              )}
              {isFuture && (
                <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                  Scheduled
                </span>
              )}
            </div>
            {item.reason && (
              <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                deleteMutation.mutate({ teamId, maintenanceId: item.id, monitorId })
              }
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaintenancePage() {
  const { teamId, monitorId } = useParams({
    from: "/(dashboard)/$teamId/monitors/$monitorId/maintenance",
  });
  const [showForm, setShowForm] = useState(false);

  const { data: maintenanceWindows, isLoading } = useQuery({
    queryKey: ["maintenance", Number(monitorId)],
    queryFn: () => fetchMaintenance(teamId, monitorId),
  });

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Link
          to="/$teamId/monitors/$monitorId"
          params={{ teamId, monitorId }}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to monitor
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Maintenance Windows</h1>
        <div className="text-muted-foreground space-y-2">
          <p>
            Schedule maintenance windows to pause monitoring during planned downtime.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>During maintenance, no checks are performed</li>
            <li>Status page shows the monitor as "Under Maintenance"</li>
            <li>No incidents or alerts are created</li>
            <li>When maintenance ends, monitoring resumes automatically</li>
          </ul>
        </div>
      </div>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="mb-6">
          Schedule Maintenance
        </Button>
      )}

      {showForm && (
        <div className="mb-6">
          <MaintenanceForm
            monitorId={Number(monitorId)}
            teamId={teamId}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Scheduled Windows</h2>
        {isLoading && <p>Loading...</p>}
        {maintenanceWindows?.length === 0 && (
          <p className="text-muted-foreground">No maintenance windows scheduled.</p>
        )}
        {maintenanceWindows
          ?.sort((a, b) => b.startsAt - a.startsAt)
          .map((item) => (
            <MaintenanceItem
              key={item.id}
              item={item}
              teamId={teamId}
              monitorId={Number(monitorId)}
            />
          ))}
      </div>
    </div>
  );
}

