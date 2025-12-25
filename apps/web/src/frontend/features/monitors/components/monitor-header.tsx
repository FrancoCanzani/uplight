import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Pause, Pencil, Play, Wrench } from "lucide-react";
import { useToggleMonitorStatus } from "../api/use-toggle-monitor-status";
import type { MonitorResponse } from "../schemas";
import MonitorDomainInfo from "./monitor-domain-info";
import MonitorInfoSheet from "./monitor-info-sheet";

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
  const isPaused = monitor.status === "paused";

  const handleTogglePause = () => {
    toggleStatus.mutate({
      teamId,
      monitorId,
      status: isPaused ? "initializing" : "paused",
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-start">
        <h1 className="text-lg font-medium">{monitor.name}</h1>
        <div className="flex items-center justify-start gap-x-2">
          <h2 className="text-xs text-muted-foreground">
            {monitor.type === "http"
              ? monitor.url
              : `${monitor.host}:${monitor.port}`}
          </h2>
          {monitor.domainCheck && (
            <MonitorDomainInfo domainCheck={monitor.domainCheck} />
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size={"xs"}
          onClick={handleTogglePause}
          disabled={toggleStatus.isPending}
        >
          {isPaused ? (
            <>
              <Play data-icon="inline-start" className="size-3" />
              Resume
            </>
          ) : (
            <>
              <Pause data-icon="inline-start" className="size-3" />
              Pause
            </>
          )}
        </Button>
        <Link
          to="/$teamId/monitors/$monitorId/maintenance"
          params={{ teamId, monitorId }}
          className={buttonVariants({ variant: "outline", size: "xs" })}
        >
          <Wrench className="size-3" />
          Maintenance
        </Link>
        <MonitorInfoSheet monitor={monitor} />
        <Link
          to="/$teamId/monitors/$monitorId/edit"
          params={{ teamId, monitorId }}
          className={buttonVariants({ variant: "outline", size: "xs" })}
        >
          <Pencil className="size-3" />
          Edit
        </Link>
      </div>
    </div>
  );
}
