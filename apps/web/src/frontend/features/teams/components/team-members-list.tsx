import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamMembers } from "../api/use-team-members";
import { TeamMemberItem } from "./team-member-item";
import { InviteMemberForm } from "../forms/invite-member-form";
import { canManageMembers } from "../utils/permissions";
import type { TeamRole } from "../schemas";
import { Plus } from "lucide-react";
import { useState } from "react";

export function TeamMembersList({
  teamId,
  currentUserRole,
  currentUserId,
}: {
  teamId: string;
  currentUserRole: TeamRole | undefined;
  currentUserId: string | undefined;
}) {
  const { data: members, isLoading } = useTeamMembers(teamId);
  const [inviteOpen, setInviteOpen] = useState(false);
  const canManage = canManageMembers(currentUserRole);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team members</CardTitle>
          {canManage && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add team member</DialogTitle>
                </DialogHeader>
                <InviteMemberForm
                  teamId={teamId}
                  onSuccess={() => setInviteOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : members && members.length > 0 ? (
          <div className="space-y-0">
            {members.map((member) => (
              <TeamMemberItem
                key={member.userId}
                member={member}
                teamId={teamId}
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No members yet</div>
        )}
      </CardContent>
    </Card>
  );
}

