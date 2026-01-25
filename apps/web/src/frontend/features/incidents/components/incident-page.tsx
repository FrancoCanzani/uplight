import { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useDebounce } from "use-debounce";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TiptapEditor from "@/components/ui/tiptap-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-6">
      <PageHeader title={incident.title ?? formatCause(incident.cause)} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status</span>
            <IncidentStatusSelector currentStatus={incident.status} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Severity</span>
            <IncidentSeveritySelector currentSeverity={incident.severity} compact />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Type</span>
            <IncidentTypeSelector currentType={incident.incidentType} compact />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Assigned to</span>
            <Select
              value={currentAssignee || "unassigned"}
              onValueChange={handleAssigneeChange}
              disabled={updateIncident.isPending}
            >
              <SelectTrigger className="w-auto h-6 text-xs border-0 bg-transparent px-1">
                <SelectValue>
                  {currentAssignee
                    ? teamMembers.find((m) => m.userId === currentAssignee)?.name ||
                      teamMembers.find((m) => m.userId === currentAssignee)?.email ||
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

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Started</span>
            <span className="text-foreground tabular-nums">{formatDate(incident.startedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Duration</span>
            <span className="text-foreground tabular-nums">{formatDuration(duration)}</span>
          </div>
          {incident.acknowledgedAt && (
            <div className="flex items-center gap-2">
              <span>Acknowledged</span>
              <span className="text-foreground tabular-nums">{formatDate(incident.acknowledgedAt)}</span>
            </div>
          )}
          {incident.recoveredAt && (
            <div className="flex items-center gap-2">
              <span>Recovered</span>
              <span className="text-green-600 tabular-nums">{formatDate(incident.recoveredAt)}</span>
            </div>
          )}
          {incident.resolvedAt && (
            <div className="flex items-center gap-2">
              <span>Resolved</span>
              <span className="text-foreground tabular-nums">{formatDate(incident.resolvedAt)}</span>
            </div>
          )}
        </div>

        <div>
          <Tabs defaultValue="overview">
            <TabsList variant="line">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="postmortem">Post-mortem</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-8">
              {(incident.description || incident.hint) && (
                <div className="space-y-4 text-sm">
                  {incident.description && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Description
                      </p>
                      <p className="leading-relaxed">{incident.description}</p>
                    </div>
                  )}
                  {incident.hint && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Suggested action
                      </p>
                      <p className="leading-relaxed">{incident.hint}</p>
                    </div>
                  )}
                </div>
              )}

              <IncidentActivity teamMembers={teamMembers} />
            </TabsContent>

            <TabsContent value="postmortem" className="mt-6">
              <div className="space-y-6">
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
                  <Label htmlFor="postmortem-title">Title</Label>
                  <Input
                    id="postmortem-title"
                    value={postMortemTitle}
                    onChange={(e) => setPostMortemTitle(e.target.value)}
                    placeholder="What happened?"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Details</Label>
                  <div className="border border-input">
                    <TiptapEditor
                      content={postMortemContent}
                      onChange={setPostMortemContent}
                      placeholder="Describe the incident, its impact, root cause, and how it was resolved..."
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
    </div>
  );
}
