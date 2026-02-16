import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MonitorResponse } from "@/features/monitors/schemas";
import { useDeleteMaintenance } from "../api/use-delete-maintenance";
import MaintenanceForm from "../forms/maintenance-form";
import type { Maintenance } from "../schemas";

export default function MaintenanceItem({
  teamId,
  monitors,
  item,
}: {
  teamId: string;
  monitors: MonitorResponse[];
  item: Maintenance;
}) {
  const [editing, setEditing] = useState(false);
  const deleteMutation = useDeleteMaintenance();
  const [now] = useState(() => Date.now());

  const isActive = item.startsAt <= now && item.endsAt > now;
  const isPast = item.endsAt <= now;
  const isFuture = item.startsAt > now;

  if (editing) {
    return (
      <MaintenanceForm
        teamId={teamId}
        monitors={monitors}
        existing={item}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      className={`p-2 border  ${isActive ? "border-l-green-700 border-l-4 -l" : ""}`}
    >
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="flex items-center justify-start space-x-1.5">
            {isActive && <Badge variant={"outline"}>Active</Badge>}
            {isPast && <Badge variant={"outline"}>Completed</Badge>}
            {isFuture && <Badge variant={"outline"}>Scheduled</Badge>}

            {item.reason ? (
              <p className="text-medium text-sm">{item.reason}</p>
            ) : (
              <p className="text-medium text-sm">Rutinary Maintenance</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {item.monitors.map((monitor) => monitor.name).join(", ")}
          </p>

          <div className="flex items-center text-muted-foreground gap-2 text-xs">
            <span>{format(new Date(item.startsAt), "MMM d, yyyy HH:mm")}</span>
            <span className="text-muted-foreground">→</span>
            <span>{format(new Date(item.endsAt), "MMM d, yyyy HH:mm")}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="xs" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            size="xs"
            variant="destructive"
            onClick={() =>
              deleteMutation.mutate({
                teamId,
                maintenanceId: item.id,
              })
            }
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
