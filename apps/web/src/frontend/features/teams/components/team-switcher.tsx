import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";

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
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full border justify-between gap-2 px-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Avatar size="sm">
              <AvatarFallback className="text-[10px]">
                {currentTeam.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">
              {currentTeam.name}
            </span>
          </div>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Switch team
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              className="cursor-pointer gap-2 py-2"
              onClick={() => handleTeamSelect(team.id)}
            >
              <Avatar size="sm">
                <AvatarFallback className="text-[10px]">
                  {team.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="truncate text-sm">{team.name}</span>
                {team.personal && (
                  <span className="text-[10px] text-muted-foreground">
                    Personal
                  </span>
                )}
              </div>
              {team.id === currentTeam.id && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <Separator className="my-1" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer gap-2">
            <Link
              to="/$teamId/team"
              params={{ teamId: String(currentTeam.id) }}
              className="w-full flex items-center gap-2"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Manage team</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2">
            <Link
              to="/$teamId/new-team"
              params={{ teamId: String(currentTeam.id) }}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span>Create new team</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
