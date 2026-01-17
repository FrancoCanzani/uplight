import { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { MoreHorizontal, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth/client";
import { useDeleteTeam } from "../api/use-delete-team";
import { useRemoveMember } from "../api/use-remove-member";
import { useTeamMembers } from "../api/use-team-members";
import { useUpdateMemberRole } from "../api/use-update-member-role";
import { InviteMemberForm } from "../forms/invite-member-form";
import { UpdateTeamForm } from "../forms/update-team-form";
import type { TeamMemberResponse, TeamRole } from "../schemas";
import {
  canChangeRole,
  canDeleteTeam,
  canManageMembers,
  canManageTeam,
  canRemoveMember,
} from "../utils/permissions";

const routeApi = getRouteApi("/(dashboard)/$teamId");

function MemberRow({
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
    removeMember.mutate({
      teamId,
      userId: member.userId,
    });
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Avatar size="sm">
          <AvatarFallback className="text-[10px]">
            {member.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-sm truncate">
            {member.name}
            {isCurrentUser && (
              <span className="text-muted-foreground ml-1">(you)</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {member.email}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-[10px] capitalize">
          {member.role}
        </Badge>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="h-6 w-6">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              }
            ></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {member.role !== "owner" &&
                canChangeRole(currentUserRole, member.role, "owner") && (
                  <DropdownMenuItem
                    onClick={() => handleRoleChange("owner")}
                    disabled={updateRole.isPending}
                  >
                    Make owner
                  </DropdownMenuItem>
                )}
              {member.role !== "admin" &&
                canChangeRole(currentUserRole, member.role, "admin") && (
                  <DropdownMenuItem
                    onClick={() => handleRoleChange("admin")}
                    disabled={updateRole.isPending}
                  >
                    Make admin
                  </DropdownMenuItem>
                )}
              {member.role !== "member" &&
                canChangeRole(currentUserRole, member.role, "member") && (
                  <DropdownMenuItem
                    onClick={() => handleRoleChange("member")}
                    disabled={updateRole.isPending}
                  >
                    Make member
                  </DropdownMenuItem>
                )}
              {!isCurrentUser &&
                canRemoveMember(currentUserRole, member.role) && (
                  <>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          />
                        }
                      >
                        Remove
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove member</AlertDialogTitle>
                          <AlertDialogDescription>
                            {member.name} will lose access to this team and all
                            its resources.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRemove}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function TeamManagementPage() {
  const { currentTeam } = routeApi.useLoaderData();
  const { data: session } = useSession();
  const { data: members, isLoading } = useTeamMembers(String(currentTeam.id));
  const deleteTeam = useDeleteTeam();
  const [inviteOpen, setInviteOpen] = useState(false);

  const canManage = canManageTeam(currentTeam.role);
  const canDelete = canDeleteTeam(currentTeam.role);
  const canInvite = canManageMembers(currentTeam.role);

  return (
    <div className="max-w-xl w-full mx-auto space-y-8">
      <PageHeader title="Team" />
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          General
        </h2>
        <div className="space-y-1">
          {canManage ? (
            <UpdateTeamForm team={currentTeam} />
          ) : (
            <div>
              <div className="text-xs text-muted-foreground">Team name</div>
              <div className="text-sm">{currentTeam.name}</div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Members {members && `(${members.length})`}
          </h2>
          {canInvite && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger
                render={
                  <Button variant="ghost" size="sm" className="h-7 text-xs" />
                }
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add member</DialogTitle>
                </DialogHeader>
                <InviteMemberForm
                  teamId={String(currentTeam.id)}
                  onSuccess={() => setInviteOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="divide-y">
          {isLoading ? (
            <div className="py-4 text-sm text-muted-foreground">Loading...</div>
          ) : members && members.length > 0 ? (
            members.map((member) => (
              <MemberRow
                key={member.userId}
                member={member}
                teamId={String(currentTeam.id)}
                currentUserRole={currentTeam.role}
                currentUserId={session?.user?.id}
              />
            ))
          ) : (
            <div className="py-4 text-sm text-muted-foreground">No members</div>
          )}
        </div>
      </section>

      {canDelete && !currentTeam.personal && (
        <section className="space-y-3 pt-4 border-t">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Danger zone
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Delete team</div>
              <div className="text-xs text-muted-foreground">
                Permanently delete this team, all monitors, incidents, and data.
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  />
                }
              >
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {currentTeam.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      This action cannot be undone. This will permanently
                      delete:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>All monitors and their check history</li>
                      <li>All incidents and activity logs</li>
                      <li>All notification configurations</li>
                      <li>All team member associations</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteTeam.mutate(String(currentTeam.id))}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete team
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      )}
    </div>
  );
}
