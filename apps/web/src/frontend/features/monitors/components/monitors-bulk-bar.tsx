import { useState } from "react";
import { Pause, Play, Trash2, X } from "lucide-react";
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
import type { MonitorResponse } from "../schemas";
import { useBulkMonitorAction } from "../api/use-bulk-monitor-action";

interface MonitorsBulkBarProps {
  selectedIds: number[];
  monitors: MonitorResponse[];
  teamId: string;
  onClearSelection: () => void;
}

export default function MonitorsBulkBar({
  selectedIds,
  monitors,
  teamId,
  onClearSelection,
}: MonitorsBulkBarProps) {
  const bulkAction = useBulkMonitorAction();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const count = selectedIds.length;
  const hasPaused = selectedIds.some((id) =>
    monitors.find((m) => m.id === id && m.status === "paused"),
  );

  if (count === 0) return null;

  const handleAction = (action: "pause" | "resume") => {
    bulkAction.mutate(
      { teamId, action, monitorIds: selectedIds },
      { onSuccess: onClearSelection },
    );
  };

  const handleDelete = () => {
    bulkAction.mutate(
      { teamId, action: "delete", monitorIds: selectedIds },
      {
        onSuccess: () => {
          onClearSelection();
          setDeleteDialogOpen(false);
        },
      },
    );
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 border border-border bg-background px-4 py-2 shadow-lg">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {count} selected
        </span>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            className="font-normal"
            onClick={() => handleAction("pause")}
            disabled={bulkAction.isPending}
          >
            <Pause className="size-3" />
            Pause
          </Button>
          {hasPaused && (
            <Button
              variant="ghost"
              size="xs"
              className="font-normal"
              onClick={() => handleAction("resume")}
              disabled={bulkAction.isPending}
            >
              <Play className="size-3" />
              Resume
            </Button>
          )}
          <Button
            variant="ghost"
            size="xs"
            className="font-normal text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={bulkAction.isPending}
          >
            <Trash2 className="size-3" />
            Delete
          </Button>
        </div>
        <div className="h-4 w-px bg-border" />
        <Button
          variant="ghost"
          size="xs"
          className="font-normal"
          onClick={onClearSelection}
          aria-label="Clear selection"
        >
          <X className="size-3" />
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {count} monitor{count !== 1 ? "s" : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {count === 1 ? "this monitor" : `these ${count} monitors`} and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="xs" disabled={bulkAction.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size="xs"
              variant="destructive"
              disabled={bulkAction.isPending}
              onClick={handleDelete}
            >
              {bulkAction.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
