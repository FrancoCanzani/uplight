import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { formatCause } from "@lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import type { KanbanIncident } from "../api/fetch-kanban-incidents";
import { getRelevantTimestamp } from "../utils/get-relevant-timestamp";

export default function DraggableIncident({
  incident,
}: {
  incident: KanbanIncident;
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
      className="p-2 shadow-xs border rounded bg-background cursor-grab hover:border-foreground/20 space-y-2 transition-colors"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm truncate">{incident.monitorName}</h4>
        <p className="text-xs text-muted-foreground font-mono">
          {formatDistanceToNowStrict(timestamp, { addSuffix: true })}
        </p>
      </div>

      <p className="text-sm">{formatCause(incident.cause)}</p>
    </div>
  );
}
