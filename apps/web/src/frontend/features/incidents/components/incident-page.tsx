import { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
import { useSession } from "@/lib/auth/client";
import { formatCause } from "@lib/utils";
import { useTeamMembers } from "../../teams/api/use-team-members";
import { useUpdateIncident } from "../api/use-update-incident";
import useUpdateIncidentPostMortem from "../api/use-update-incident-post-mortem";
import { IncidentActivity } from "./incident-activity";
import { IncidentSidebar } from "./incident-sidebar";
import { IncidentSeveritySelector } from "./incident-severity-selector";
import { IncidentStatusSelector } from "./incident-status-selector";
import { IncidentTypeSelector } from "./incident-type-selector";

export default function IncidentPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/$incidentId");
  const incident = routeApi.useLoaderData();
  const { teamId, incidentId } = routeApi.useParams();
  const { data: teamMembersData } = useTeamMembers(teamId);
  const { data: session } = useSession();

  const [postMortemTitle, setPostMortemTitle] = useState(
    incident.postMortemTitle ?? "",
  );
  const [postMortemContent, setPostMortemContent] = useState(
    incident.postMortemContent ?? "",
  );

  const updateMutation = useUpdateIncidentPostMortem();
  const updateIncident = useUpdateIncident();

  const handleSavePostMortem = () => {
    updateMutation.mutate({
      teamId,
      incidentId,
      postMortemTitle: postMortemTitle || null,
      postMortemContent: postMortemContent || null,
    });
  };

  const teamMembers = teamMembersData || [];
  const user = session?.user;

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden -mb-20 md:-mb-6">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 lg:px-6 shrink-0">
          <PageHeader title={incident.title ?? formatCause(incident.cause)} />
        </div>

        <div className="flex-1 flex flex-col px-4 lg:px-6 pb-4 min-h-0">
          <Tabs defaultValue="activity" className="flex flex-col h-full">
            <TabsList variant="line" className="shrink-0">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="postmortem">Post-mortem</TabsTrigger>
              <TabsTrigger value="details" className="lg:hidden">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="flex-1 flex flex-col mt-6 data-[state=active]:flex data-[state=inactive]:hidden min-h-0">
              <IncidentActivity teamMembers={teamMembers} />
            </TabsContent>

            <TabsContent value="postmortem" className="flex-1 overflow-y-auto mt-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                Document what happened and how it was resolved.
              </p>

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

              <div className="flex justify-end">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleSavePostMortem}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details" className="flex-1 overflow-y-auto mt-6 lg:hidden">
              <div className="space-y-4 text-sm">
                {incident.description && (
                  <div className="space-y-1.5 pb-4 border-b">
                    <div className="text-xs font-medium text-muted-foreground">
                      Description
                    </div>
                    <div className="text-xs leading-relaxed">{incident.description}</div>
                  </div>
                )}

                {incident.hint && (
                  <div className="space-y-1.5 pb-4 border-b">
                    <div className="text-xs font-medium text-muted-foreground">
                      Suggested action
                    </div>
                    <div className="text-xs leading-relaxed">{incident.hint}</div>
                  </div>
                )}

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
                      value={incident.assignees?.[0] || "unassigned"}
                      onValueChange={(userId) => {
                        if (!userId) return;
                        updateIncident.mutate({
                          teamId: Number(teamId),
                          incidentId: Number(incidentId),
                          assignees: userId === "unassigned" ? [] : [userId],
                        });
                      }}
                      disabled={updateIncident.isPending}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue>
                          {incident.assignees?.[0]
                            ? teamMembers.find((m) => m.userId === incident.assignees?.[0])
                                ?.name ||
                              teamMembers.find((m) => m.userId === incident.assignees?.[0])
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="hidden lg:block">
        <IncidentSidebar incident={incident} />
      </div>
    </div>
  );
}
