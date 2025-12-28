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
import { getRouteApi, Link } from "@tanstack/react-router";
import { ChevronsUpDown } from "lucide-react";

const routeApi = getRouteApi("/(dashboard)/$teamId");

export function TeamSwitcher() {
  const { teams, currentTeam } = routeApi.useLoaderData();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="w-full border justify-between">
            <span className="truncate">{currentTeam.name}</span>
            <ChevronsUpDown className="size-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Teams</DropdownMenuLabel>
          {teams.map((team) => (
            <DropdownMenuItem key={team.id} className="cursor-pointer">
              <Link
                to="/$teamId"
                params={{ teamId: String(team.id) }}
                className="w-full"
              >
                <div className="flex items-center gap-2">
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
        <Separator className={"my-1"} />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team settings</DropdownMenuItem>
          <DropdownMenuItem>New team</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
