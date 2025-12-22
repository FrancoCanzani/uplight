import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRouteApi, Link } from "@tanstack/react-router";
import { ChevronsUpDown } from "lucide-react";

const routeApi = getRouteApi("/(dashboard)/$teamId");

export function TeamSwitcher() {
  const { teams, currentTeam } = routeApi.useLoaderData();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          className="w-full justify-between px-2 font-normal"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-medium">
              {currentTeam.name.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{currentTeam.name}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Teams</DropdownMenuLabel>
          {teams.map((team) => (
            <DropdownMenuItem key={team.id} className="cursor-pointer">
              <Link to="/$teamId" params={{ teamId: String(team.id) }}>
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
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
