import { format } from "date-fns";
import type { IncidentActivity } from "../types";

export function CommentCard({ activity }: { activity: IncidentActivity }) {
  const time = format(new Date(activity.createdAt), "HH:mm");
  const actorName = activity.userName || activity.userEmail || "Unknown user";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{actorName}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{time}</span>
      </div>
      {activity.content && (
        <p className="text-sm whitespace-pre-wrap break-words">
          {activity.content}
        </p>
      )}
    </div>
  );
}
