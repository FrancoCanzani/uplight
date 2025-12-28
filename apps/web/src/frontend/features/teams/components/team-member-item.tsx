import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateMemberRole } from "../api/use-update-member-role";
import { useRemoveMember } from "../api/use-remove-member";
import { canManageMembers } from "../utils/permissions";
import type { TeamMemberResponse, TeamRole } from "../schemas";
import { MoreVertical } from "lucide-react";

export function TeamMemberItem({
  member,
  teamId,
  currentUserRole,
  currentUserId,
}: {
  member: TeamMemberResponse;
  teamId: string;
  currentUserRole: TeamRole | undefined;
  currentUserId: string | undefined;
}) {
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const canManage = canManageMembers(currentUserRole);
  const isCurrentUser = member.userId === currentUserId;

  const handleRoleChange = (newRole: TeamRole) => {
    if (newRole === member.role) return;
    updateRole.mutate({
      teamId,
      userId: member.userId,
      data: { role: newRole },
    });
  };

  const handleRemove = () => {
    if (confirm(`Remove ${member.name} from the team?`)) {
      removeMember.mutate({
        teamId,
        userId: member.userId,
      });
    }
  };

  const roleColors: Record<TeamRole, string> = {
    owner: "default",
    admin: "secondary",
    member: "outline",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium">{member.name}</div>
          <div className="text-sm text-muted-foreground">{member.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={roleColors[member.role] as any}>
          {member.role}
        </Badge>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {member.role !== "owner" && (
                <DropdownMenuItem onClick={() => handleRoleChange("owner")}>
                  Make owner
                </DropdownMenuItem>
              )}
              {member.role !== "admin" && (
                <DropdownMenuItem onClick={() => handleRoleChange("admin")}>
                  Make admin
                </DropdownMenuItem>
              )}
              {member.role !== "member" && (
                <DropdownMenuItem onClick={() => handleRoleChange("member")}>
                  Make member
                </DropdownMenuItem>
              )}
              {!isCurrentUser && (
                <DropdownMenuItem
                  onClick={handleRemove}
                  className="text-destructive"
                >
                  Remove from team
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

