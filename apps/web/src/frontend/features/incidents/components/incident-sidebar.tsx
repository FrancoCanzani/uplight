import { getRouteApi } from "@tanstack/react-router";
import { Facehash } from "facehash";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { useTeamMembers } from "../../teams/api/use-team-members";
import { useUpdateIncident } from "../api/use-update-incident";
import { IncidentSeveritySelector } from "./incident-severity-selector";
import { IncidentTypeSelector } from "./incident-type-selector";
import { IncidentStatusSelector } from "./incident-status-selector";
import type { Incident } from "../types";

interface TeamMember {
  userId: string;
  name: string | null;
  email: string;
}

export function IncidentSidebar({ incident }: { incident: Incident }) {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/$incidentId");
  const { teamId, incidentId } = routeApi.useParams();
  const { data: teamMembersData } = useTeamMembers(teamId);
  const updateIncident = useUpdateIncident();

  const teamMembers = (teamMembersData || []) as TeamMember[];
  const currentAssignee = incident.assignees?.[0] || null;
  const currentAssigneeName = currentAssignee
    ? teamMembers.find((m) => m.userId === currentAssignee)?.name ||
      teamMembers.find((m) => m.userId === currentAssignee)?.email ||
      "Unknown"
    : null;

  const handleAssigneeChange = (userId: string | null) => {
    if (!userId) return;
    updateIncident.mutate({
      teamId: Number(teamId),
      incidentId: Number(incidentId),
      assignees: userId === "unassigned" ? [] : [userId],
    });
  };

  return (
    <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto h-full">
      <div className="p-4 space-y-4 text-sm">
        {/* Description & Hint at TOP */}
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

        {/* Properties */}
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
                  {currentAssignee ? (
                    <div className="flex items-center gap-2">
                      <Facehash
                        name={currentAssigneeName || ""}
                        size={16}
                        variant="solid"
                      />
                      <span>{currentAssigneeName}</span>
                    </div>
                  ) : (
                    "Unassigned"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <span className="text-muted-foreground">Unassigned</span>
                </SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    <div className="flex items-center gap-2">
                      <Facehash
                        name={member.name || member.email}
                        size={16}
                        variant="solid"
                      />
                      <span>{member.name || member.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </aside>
  );
}
