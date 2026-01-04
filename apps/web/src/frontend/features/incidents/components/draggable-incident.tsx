import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { cn, formatCause } from "@lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import type { Incident } from "../types";
import { getRelevantTimestamp } from "../utils/get-relevant-timestamp";

export default function DraggableIncident({
  incident,
}: {
  incident: Incident;
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return draggable({
      element: el,
      getInitialData: () => ({ incidentId: incident.id }),
    });
  }, [incident.id]);

  const timestamp = getRelevantTimestamp(incident);

  return (
    <div
      ref={ref}
      className={cn(
        "p-1.5 rounded bg-background cursor-grab gap-2 flex flex-col",

        incident.status === "active"
          ? "bg-red-50/50 hover:bg-red-50 transition-colors duration-300"
          : incident.status === "acknowledged"
            ? "bg-blue-50/50 hover:bg-blue-50 transition-colors duration-300"
            : "bg-green-50/50 hover:bg-green-50 transition-colors duration-300",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{`Id: ${incident.id}`}</span>
        <p className="text-[10px] tracking-tight text-muted-foreground font-mono">
          {formatDistanceToNowStrict(timestamp, { addSuffix: true })}
        </p>
      </div>

      <h4 className="text-sm truncate underline">{incident.monitorName}</h4>

      <p className="text-sm font-light">
        {incident.description ?? formatCause(incident.cause)}
      </p>
    </div>
  );
}
