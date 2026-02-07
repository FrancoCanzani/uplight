import { useEffect, useRef, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { isSameDay } from "date-fns";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import {
  useAddIncidentComment,
  useFetchIncidentActivities,
} from "../api/use-incident-activities";
import type { IncidentActivity } from "../types";
import { CommentCard } from "./comment-card";
import { SystemActivity } from "./system-activity";

interface TeamMember {
  userId: string;
  name: string | null;
  email: string;
}

function groupActivitiesByDate(activities: IncidentActivity[]) {
  const groups: { date: Date; activities: IncidentActivity[] }[] = [];

  const reversedActivities = [...activities].reverse();

  for (const activity of reversedActivities) {
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addComment.mutate(
      {
        teamId: Number(teamId),
        incidentId: Number(incidentId),
        content: comment,
      },
      {
        onSuccess: () => {
          setComment("");
        },
      },
    );
  };

  const groups = data?.activities ? groupActivitiesByDate(data.activities) : [];

  useEffect(() => {
    if (scrollRef.current && data?.activities) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.activities]);

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : groups.length > 0 ? (
          <>
            {groups.map((group, i) => (
              <div key={i} className="space-y-3">
                {group.activities.map((activity) =>
                  activity.type === "comment" ? (
                    <CommentCard key={activity.id} activity={activity} />
                  ) : (
                    <SystemActivity
                      key={activity.id}
                      activity={activity}
                      teamMembers={teamMembers}
                    />
                  ),
                )}
              </div>
            ))}
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No activity yet</p>
        )}
      </div>

      <form
        onSubmit={handleAddComment}
        className="border-t bg-background pt-3 pb-20 md:pb-0 shrink-0"
      >
        <div className="space-y-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment..."
            rows={3}
            className="resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="xs"
              variant="outline"
              disabled={!comment.trim() || addComment.isPending}
            >
              {addComment.isPending ? "Adding..." : "Comment"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
