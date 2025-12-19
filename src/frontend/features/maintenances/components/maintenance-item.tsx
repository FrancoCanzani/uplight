import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { useDeleteMaintenance } from "../api/use-delete-maintenance";
import MaintenanceForm from "../forms/maintenance-form";
import type { Maintenance } from "../schemas";

export default function MaintenanceItem({ item }: { item: Maintenance }) {
  const { teamId, monitorId } = useParams({
    from: "/(dashboard)/$teamId/monitors/$monitorId/maintenance",
  });

  const [editing, setEditing] = useState(false);
  const deleteMutation = useDeleteMaintenance();
  const [now] = useState(() => Date.now());

  const isActive = item.startsAt <= now && item.endsAt > now;
  const isPast = item.endsAt <= now;
  const isFuture = item.startsAt > now;

  if (editing) {
    return (
      <MaintenanceForm existing={item} onClose={() => setEditing(false)} />
    );
  }

  return (
    <div
      className={`p-2 border rounded-sm ${isActive ? "border-l-green-700 border-l-4 rounded-l" : ""}`}
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
                monitorId: Number(monitorId),
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
