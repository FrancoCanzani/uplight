import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { UpdateTeamForm } from "../forms/update-team-form";
import { TeamMembersList } from "./team-members-list";
import { useDeleteTeam } from "../api/use-delete-team";
import { canManageTeam, canDeleteTeam } from "../utils/permissions";
import type { TeamResponse, TeamRole } from "../schemas";
import { Trash2 } from "lucide-react";

export function TeamSettings({
  team,
  currentUserRole,
  currentUserId,
}: {
  team: TeamResponse;
  currentUserRole: TeamRole | undefined;
  currentUserId: string | undefined;
}) {
  const deleteTeam = useDeleteTeam();
  const canManage = canManageTeam(currentUserRole);
  const canDelete = canDeleteTeam(currentUserRole);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          {canManage ? (
            <UpdateTeamForm team={team} />
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium">Team name</div>
              <div className="text-sm text-muted-foreground">{team.name}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <TeamMembersList
        teamId={String(team.id)}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
      />

      {canDelete && !team.personal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete team
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete team</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the team and all associated
                    monitors, incidents, and data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteTeam.mutate(String(team.id))}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

