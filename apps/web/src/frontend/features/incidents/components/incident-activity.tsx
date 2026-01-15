import { getRouteApi } from "@tanstack/react-router";
import { format, formatDistanceToNow, isSameDay } from "date-fns";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import {
  useAddIncidentComment,
  useFetchIncidentActivities,
} from "../api/use-incident-activities";
import type { IncidentActivity as IncidentActivityType } from "../types";

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
  activity: IncidentActivityType,
  teamMembers: TeamMember[]
): string {
  if (activity.type === "comment") {
    return "commented";
  }

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

function ActivityItem({
  activity,
  teamMembers,
}: {
  activity: IncidentActivityType;
  teamMembers: TeamMember[];
}) {
  const time = format(new Date(activity.createdAt), "HH:mm");
  const text = getActivityText(activity, teamMembers);
  const actorName = activity.userName || activity.userEmail || "System";
  const isComment = activity.type === "comment";

  return (
    <div className="flex gap-4 py-2">
      <span className="text-xs text-muted-foreground w-10 shrink-0 tabular-nums pt-0.5">
        {time}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{actorName}</span>
          <span className="text-muted-foreground"> {text}</span>
        </p>
        {isComment && activity.content && (
          <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap break-words">
            {activity.content}
          </p>
        )}
      </div>
    </div>
  );
}

function groupActivitiesByDate(activities: IncidentActivityType[]) {
  const groups: { date: Date; activities: IncidentActivityType[] }[] = [];

  for (const activity of activities) {
    const activityDate = new Date(activity.createdAt);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && isSameDay(lastGroup.date, activityDate)) {
      lastGroup.activities.push(activity);
    } else {
      groups.push({ date: activityDate, activities: [activity] });
    }
  }

  return groups;
}

export function IncidentActivity({
  teamMembers,
}: {
  teamMembers: TeamMember[];
}) {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/$incidentId");
  const { teamId, incidentId } = routeApi.useParams();
  const [comment, setComment] = useState("");
  const { data, isLoading } = useFetchIncidentActivities({
    teamId: Number(teamId),
    incidentId: Number(incidentId),
  });
  const addComment = useAddIncidentComment();

  const handleAddComment = () => {
    if (!comment.trim()) return;

    addComment.mutate(
      { teamId: Number(teamId), incidentId: Number(incidentId), content: comment },
      {
        onSuccess: () => {
          setComment("");
        },
      }
    );
  };

  const groups = data?.activities ? groupActivitiesByDate(data.activities) : [];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Activity</h3>

      <div className="space-y-2">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment..."
          rows={2}
          className="resize-none text-sm"
        />
        <div className="flex justify-end">
          <Button
            size="xs"
            variant="outline"
            onClick={handleAddComment}
            disabled={!comment.trim() || addComment.isPending}
          >
            {addComment.isPending ? "Adding..." : "Comment"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-4">Loading...</p>
      ) : groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group, i) => (
            <div key={i}>
              <p className="text-xs text-muted-foreground mb-2">
                {format(group.date, "EEEE d MMMM yyyy")}
              </p>
              <div className="border-l-2 border-border pl-4 space-y-1">
                {group.activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    teamMembers={teamMembers}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4">No activity yet</p>
      )}
    </div>
  );
}
