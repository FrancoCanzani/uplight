import { useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import {
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Trash2,
  Wrench,
} from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { useDeleteMonitor } from "../api/use-delete-monitor";
import { useToggleMonitorStatus } from "../api/use-toggle-monitor-status";

function getMonitorDomain(monitor: {
  type: string;
  host?: string | null;
  url?: string | null;
  domainCheck?: { domain: string } | null;
}): string {
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

export default function MonitorActions() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");
  const { monitor } = routeApi.useLoaderData();
  const { teamId, monitorId } = routeApi.useParams();

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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="xs" aria-label="Monitor actions menu">
              <MoreVertical className="size-3" />
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleTogglePause();
            }}
            disabled={toggleStatus.isPending}
            className="text-xs"
          >
            {toggleStatus.isPending ? (
              <>
                <Spinner className="size-2.5" />
                {isPaused ? "Resuming..." : "Pausing..."}
              </>
            ) : isPaused ? (
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
          <Link
            to="/$teamId/monitors/$monitorId/maintenance"
            params={{ teamId, monitorId }}
          >
            <DropdownMenuItem className="text-xs">
              <Wrench className="size-2.5" />
              Maintenance
            </DropdownMenuItem>
          </Link>
          <Link
            to="/$teamId/monitors/$monitorId/edit"
            params={{ teamId, monitorId }}
          >
            <DropdownMenuItem className="text-xs">
              <Pencil className="size-2.5" />
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
