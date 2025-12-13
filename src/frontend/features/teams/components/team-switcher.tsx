import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { ChevronsUpDown, Plus, Settings } from "lucide-react";
import { useCurrentTeam } from "../context/team-context";

export function TeamSwitcher() {
  const { teams, currentTeam, setCurrentTeamId, isLoading } = useCurrentTeam();

  if (isLoading) {
    return <div className="h-10 w-full animate-pulse rounded-md bg-muted" />;
  }

  if (!teams || teams.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          className="w-full justify-between px-2 font-normal"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-medium">
              {currentTeam?.name.charAt(0).toUpperCase() ?? "T"}
            </div>
            <span className="truncate">
              {currentTeam?.name ?? "Select team"}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Teams</DropdownMenuLabel>
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              onClick={() => setCurrentTeamId(team.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-medium">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <span>{team.name}</span>
                {team.personal && (
                  <span className="text-xs text-muted-foreground">
                    (Personal)
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link to="/dashboard/teams/new" className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Create team
            </Link>
          </DropdownMenuItem>
          {currentTeam && !currentTeam.personal && (
            <DropdownMenuItem>
              <Link
                to="/dashboard/teams/$teamId"
                params={{ teamId: String(currentTeam.id) }}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Team settings
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
