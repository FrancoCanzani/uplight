import { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useDebounce } from "use-debounce";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TiptapEditor from "@/components/ui/tiptap-editor";
import { formatCause, formatDate, formatDuration } from "@lib/utils";
import { useTeamMembers } from "../../teams/api/use-team-members";
import { useUpdateIncident } from "../api/use-update-incident";
import useUpdateIncidentPostMortem from "../api/use-update-incident-post-mortem";
import { IncidentActivity } from "./incident-activity";
import { IncidentSeveritySelector } from "./incident-severity-selector";
import { IncidentStatusSelector } from "./incident-status-selector";
import { IncidentTypeSelector } from "./incident-type-selector";

export default function IncidentPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/$incidentId");
  const incident = routeApi.useLoaderData();
  const { teamId, incidentId } = routeApi.useParams();
  const { data: teamMembersData } = useTeamMembers(teamId);
  const updateIncident = useUpdateIncident();

  const [postMortemTitle, setPostMortemTitle] = useState(
    incident.postMortemTitle ?? "",
  );
  const [postMortemContent, setPostMortemContent] = useState(
    incident.postMortemContent ?? "",
  );

  const [debouncedTitle] = useDebounce(postMortemTitle, 1000);
  const [debouncedContent] = useDebounce(postMortemContent, 1000);
  const [showSaved, setShowSaved] = useState(false);

  const updateMutation = useUpdateIncidentPostMortem();

  useEffect(() => {
    if (
      debouncedTitle === postMortemTitle &&
      debouncedContent === postMortemContent
    ) {
      const hasChanges =
        debouncedTitle !== (incident.postMortemTitle ?? "") ||
        debouncedContent !== (incident.postMortemContent ?? "");

      if (hasChanges) {
        updateMutation.mutate(
          {
            teamId,
            incidentId,
            postMortemTitle: debouncedTitle || null,
            postMortemContent: debouncedContent || null,
          },
          {
            onSuccess: () => {
              setShowSaved(true);
              setTimeout(() => setShowSaved(false), 2000);
            },
          },
        );
      }
    }
  }, [
    debouncedTitle,
    debouncedContent,
    postMortemTitle,
    postMortemContent,
    teamId,
    incidentId,
    incident.postMortemTitle,
    incident.postMortemContent,
    updateMutation,
  ]);

  const duration = incident.resolvedAt
    ? incident.resolvedAt - incident.startedAt
    : incident.recoveredAt
      ? incident.recoveredAt - incident.startedAt
      : Date.now() - incident.startedAt;

  const teamMembers = teamMembersData || [];
  const currentAssignee = incident.assignees?.[0] || null;

  const handleAssigneeChange = (userId: string | null) => {
    if (!userId) return;
    updateIncident.mutate({
      teamId: Number(teamId),
      incidentId: Number(incidentId),
      assignees: userId === "unassigned" ? [] : [userId],
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="flex-1 overflow-auto">
        <div className="px-4 lg:px-6 pb-20 md:pb-0 space-y-6">
          <PageHeader title={incident.title ?? formatCause(incident.cause)} />

          <Tabs defaultValue="activity">
            <TabsList variant="line">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="postmortem">Post-mortem</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              <IncidentActivity teamMembers={teamMembers} />
            </TabsContent>

            <TabsContent value="postmortem" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Document what happened and how it was resolved.
                </p>
                {showSaved && (
                  <span className="text-xs text-muted-foreground animate-pulse">
                    Saved
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="postmortem-title" className="text-xs">
                  Title
                </Label>
                <Input
                  id="postmortem-title"
                  value={postMortemTitle}
                  onChange={(e) => setPostMortemTitle(e.target.value)}
                  placeholder="What happened?"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Details</Label>
                <div className="border border-input p-2 text-xs placeholder:text-xs">
                  <TiptapEditor
                    content={postMortemContent}
                    onChange={setPostMortemContent}
                    placeholder="Describe the incident, its impact, root cause, and how it was resolved..."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border overflow-auto bg-surface/30">
        <div className="p-4 space-y-6 text-sm">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">
                Status
              </Label>
              <IncidentStatusSelector currentStatus={incident.status} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">
                Severity
              </Label>
              <IncidentSeveritySelector
                currentSeverity={incident.severity}
                compact={false}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">
                Type
              </Label>
              <IncidentTypeSelector
                currentType={incident.incidentType}
                compact={false}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">
                Assigned to
              </Label>
              <Select
                value={currentAssignee || "unassigned"}
                onValueChange={handleAssigneeChange}
                disabled={updateIncident.isPending}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue>
                    {currentAssignee
                      ? teamMembers.find((m) => m.userId === currentAssignee)
                          ?.name ||
                        teamMembers.find((m) => m.userId === currentAssignee)
                          ?.email ||
                        "Unknown"
                      : "Unassigned"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <span className="text-muted-foreground">Unassigned</span>
                  </SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Started</div>
              <div className="text-xs tabular-nums">
                {formatDate(incident.startedAt)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="text-xs tabular-nums">
                {formatDuration(duration)}
              </div>
            </div>

            {incident.acknowledgedAt && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Acknowledged
                </div>
                <div className="text-xs tabular-nums">
                  {formatDate(incident.acknowledgedAt)}
                </div>
              </div>
            )}

            {incident.recoveredAt && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Recovered</div>
                <div className="text-xs text-green-600 tabular-nums">
                  {formatDate(incident.recoveredAt)}
                </div>
              </div>
            )}

            {incident.resolvedAt && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Resolved</div>
                <div className="text-xs tabular-nums">
                  {formatDate(incident.resolvedAt)}
                </div>
              </div>
            )}
          </div>

          {(incident.description || incident.hint) && (
            <div className="border-t pt-4 space-y-3">
              {incident.description && (
                <div className="space-y-1.5">
                  <div className="text-xs text-muted-foreground">
                    Description
                  </div>
                  <div className="text-xs leading-relaxed">
                    {incident.description}
                  </div>
                </div>
              )}
              {incident.hint && (
                <div className="space-y-1.5">
                  <div className="text-xs text-muted-foreground">
                    Suggested action
                  </div>
                  <div className="text-xs leading-relaxed">{incident.hint}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
