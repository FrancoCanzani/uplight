import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const routeApi = getRouteApi("/(dashboard)/$teamId");

export function TeamSwitcher() {
  const { teams, currentTeam } = routeApi.useLoaderData();
  const navigate = useNavigate();

  const handleTeamSelect = (teamId: number) => {
    navigate({
      to: "/$teamId",
      params: { teamId: String(teamId) },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="w-full h-14 justify-between gap-2 px-3 rounded-none border-b border-b-border/30"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-4 flex overflow-hidden shrink-0">
                <div className="flex-1 bg-red-600" />
                <div className="flex-1 bg-green-600" />
                <div className="flex-1 bg-blue-600" />
              </div>
              <span className="truncate text-sm font-medium">
                {currentTeam.name}
              </span>
            </div>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Team management</DropdownMenuLabel>
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              className="cursor-pointer"
              onClick={() => handleTeamSelect(team.id)}
            >
              <span className="truncate text-xs">{team.name}</span>
              {team.id === currentTeam.id && (
                <Check className="size-3 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <Separator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <Link
              to="/$teamId/team"
              params={{ teamId: String(currentTeam.id) }}
              className="w-full flex items-center gap-2"
            >
              <Users className="size-3 text-muted-foreground" />
              <span>Manage team</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Link
              to="/$teamId/new-team"
              params={{ teamId: String(currentTeam.id) }}
              className="w-full flex items-center gap-2"
            >
              <Plus className="size-3 text-muted-foreground" />
              <span>Create new team</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
