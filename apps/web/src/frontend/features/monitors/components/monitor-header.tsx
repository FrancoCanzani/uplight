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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import {
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Trash2,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useDeleteMonitor } from "../api/use-delete-monitor";
import { useToggleMonitorStatus } from "../api/use-toggle-monitor-status";
import type { MonitorResponse } from "../schemas";
import MonitorDomainInfo from "./monitor-domain-info";
import MonitorInfoSheet from "./monitor-info-sheet";

function getMonitorDomain(monitor: MonitorResponse): string {
  if (monitor.type === "tcp") {
    return monitor.host || "";
  }
  if (monitor.domainCheck?.domain) {
    return monitor.domainCheck.domain;
  }
  if (monitor.url) {
    try {
      const url = new URL(monitor.url);
      return url.hostname;
    } catch {
      return monitor.url;
    }
  }
  return "";
}

export default function MonitorHeader({
  monitor,
  teamId,
  monitorId,
}: {
  monitor: MonitorResponse;
  teamId: string;
  monitorId: string;
}) {
  const toggleStatus = useToggleMonitorStatus();
  const deleteMonitor = useDeleteMonitor();
  const isPaused = monitor.status === "paused";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const monitorDomain = getMonitorDomain(monitor);
  const isDeleteEnabled = deleteConfirmation === monitorDomain;

  const handleTogglePause = () => {
    toggleStatus.mutate({
      teamId,
      monitorId,
      status: isPaused ? "initializing" : "paused",
    });
  };

  const handleDelete = () => {
    if (isDeleteEnabled) {
      deleteMonitor.mutate(
        { teamId, monitorId },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setDeleteConfirmation("");
          },
        },
      );
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-medium">{monitor.name}</h1>

        <div className="flex gap-2 items-center justify-end">
          <div className="flex items-center justify-start gap-x-2">
            {monitor.type === "tcp" ? (
              <h2 className="text-xs text-muted-foreground">
                `${monitor.host}:${monitor.port}`
              </h2>
            ) : monitor.domainCheck ? (
              <MonitorDomainInfo monitor={monitor} />
            ) : (
              <h2 className="text-xs text-muted-foreground">{monitor.url}</h2>
            )}
          </div>
          <MonitorInfoSheet monitor={monitor} />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="xs">
                <MoreVertical className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleTogglePause();
                }}
                disabled={toggleStatus.isPending}
              >
                {isPaused ? (
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
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link
                to="/$teamId/monitors/$monitorId/maintenance"
                params={{ teamId, monitorId }}
              >
                <DropdownMenuItem>
                  <Wrench className="size-3" />
                  Maintenance
                </DropdownMenuItem>
              </Link>
              <Link
                to="/$teamId/monitors/$monitorId/edit"
                params={{ teamId, monitorId }}
              >
                <DropdownMenuItem>
                  <Pencil className="size-3" />
                  Edit
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="size-3" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              monitor and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              To confirm, please type the domain name:{" "}
              <strong>{monitorDomain}</strong>
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder={monitorDomain}
              className="font-mono text-xs"
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
              disabled={!isDeleteEnabled || deleteMonitor.isPending}
              variant="destructive"
            >
              {deleteMonitor.isPending ? "Deleting..." : "Delete Monitor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
