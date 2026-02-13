import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, MoreHorizontal, Pause, Pencil, Play, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteMonitor } from "../api/use-delete-monitor";
import { useToggleMonitorStatus } from "../api/use-toggle-monitor-status";
import type { MonitorResponse } from "../schemas";

export default function MonitorTableRowActions({
  monitor,
}: {
  monitor: MonitorResponse;
}) {
  const teamId = String(monitor.teamId);
  const toggleStatus = useToggleMonitorStatus();
  const deleteMonitor = useDeleteMonitor();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isPaused = monitor.status === "paused";

  const handleTogglePause = () => {
    toggleStatus.mutate({
      teamId,
      monitorId: String(monitor.id),
      status: isPaused ? "initializing" : "paused",
    });
  };

  const handleDelete = () => {
    deleteMonitor.mutate(
      {
        teamId,
        monitorId: String(monitor.id),
      },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
        },
      },
    );
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreHorizontal className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link
            to="/$teamId/monitors/$monitorId"
            params={{ teamId, monitorId: String(monitor.id) }}
          >
            <DropdownMenuItem className="text-xs">
              <Eye className="size-2.5" />
              View
            </DropdownMenuItem>
          </Link>
          <Link
            to="/$teamId/monitors/$monitorId/edit"
            params={{ teamId, monitorId: String(monitor.id) }}
          >
            <DropdownMenuItem className="text-xs">
              <Pencil className="size-2.5" />
              Edit
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleTogglePause();
            }}
            disabled={toggleStatus.isPending}
            className="text-xs"
          >
            {isPaused ? (
              <>
                <Play className="size-2.5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="size-2.5" />
                Pause
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              setDeleteDialogOpen(true);
            }}
            className="text-xs"
          >
            <Trash2 className="size-2.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              monitor and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="xs" disabled={deleteMonitor.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size="xs"
              variant="destructive"
              disabled={deleteMonitor.isPending}
              onClick={handleDelete}
            >
              {deleteMonitor.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
