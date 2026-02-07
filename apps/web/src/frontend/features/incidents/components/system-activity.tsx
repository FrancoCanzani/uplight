import { format } from "date-fns";
import type { IncidentActivity } from "../types";

interface TeamMember {
  userId: string;
  name: string | null;
  email: string;
}

function resolveUserName(userId: string, teamMembers: TeamMember[]): string {
  const member = teamMembers.find((m) => m.userId === userId);
  return member?.name || member?.email || "Unknown user";
}

function getActivityText(
  activity: IncidentActivity,
  teamMembers: TeamMember[],
): string {
  if (activity.type === "status_change" && activity.metadata) {
    const meta = JSON.parse(activity.metadata);
    return `changed status from ${meta.from} to ${meta.to}`;
  }

  if (activity.type === "assignee_added" && activity.metadata) {
    const meta = JSON.parse(activity.metadata);
    const assigneeName = resolveUserName(meta.assignedUserId, teamMembers);
    return `assigned ${assigneeName}`;
  }

  if (activity.type === "assignee_removed" && activity.metadata) {
    const meta = JSON.parse(activity.metadata);
    const assigneeName = resolveUserName(meta.removedUserId, teamMembers);
    return `unassigned ${assigneeName}`;
  }

  if (activity.type === "type_changed" && activity.metadata) {
    const meta = JSON.parse(activity.metadata);
    return `changed type from ${meta.from || "none"} to ${meta.to}`;
  }

  if (activity.type === "severity_changed" && activity.metadata) {
    const meta = JSON.parse(activity.metadata);
    return `changed severity from ${meta.from || "none"} to ${meta.to}`;
  }

  return activity.type.replace(/_/g, " ");
}

export function SystemActivity({
  activity,
  teamMembers,
}: {
  activity: IncidentActivity;
  teamMembers: TeamMember[];
}) {
  const time = format(new Date(activity.createdAt), "HH:mm");
  const actorName = activity.userName || activity.userEmail || "System";
  const text = getActivityText(activity, teamMembers);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{actorName}</span>
      <span>{text}</span>
      <span className="text-xs tabular-nums">• {time}</span>
    </div>
  );
}
