import { EyeIcon } from "@/components/motion/icons/eye";
import { FlameIcon } from "@/components/motion/icons/flame";
import { WrenchIcon } from "@/components/motion/icons/wrench";
import NoDataMessage from "@/components/no-data-message";
import { cn } from "@/lib/utils";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import type { Incident, KanbanStatus } from "../types";
import DraggableIncident from "./draggable-incident";

const STATUS_ICONS = {
  active: FlameIcon,
  acknowledged: EyeIcon,
  fixing: WrenchIcon,
} as const;

export default function DroppableIncidentColumn({
  incidents,
  status,
  onDrop,
}: {
  incidents: Incident[];
  status: KanbanStatus;
  onDrop: (incidentId: number, newStatus: KanbanStatus) => void;
}) {
  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const StatusIcon = STATUS_ICONS[status];

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return dropTargetForElements({
      element: el,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: ({ source }) => {
        setIsDraggedOver(false);
        const incidentId = source.data.incidentId as number;
        onDrop(incidentId, status);
      },
    });
  }, [status, onDrop]);

  return (
    <div
      ref={ref}
      className={cn(
        "p-2 overflow-y-scroll rounded gap-2 flex flex-col",
        isDraggedOver ? "bg-surface" : "bg-surface/50",
      )}
    >
      <div className="flex items-center gap-2">
        <StatusIcon size={14} />
        <h2 className="text-sm font-medium capitalize">{status}</h2>
      </div>
      {incidents.length > 0 ? (
        <div className="space-y-2">
          {incidents.map((incident) => (
            <DraggableIncident key={incident.id} incident={incident} />
          ))}
        </div>
      ) : (
        <NoDataMessage
          text={`No ${status} incidents`}
          className="flex-1 flex items-center justify-center"
        />
      )}
    </div>
  );
}
