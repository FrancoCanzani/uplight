import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/client";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import DashboardHeaderSection from "./dashboard-header-section";

const routeApi = getRouteApi("/(dashboard)/$teamId");

export default function DashboardHeader() {
  const { teamId } = routeApi.useParams();
  const { teams, currentTeam } = routeApi.useLoaderData();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="flex flex-col fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 supports-backdrop-filter:bg-background/50">
      <div className="relative">
        <div className="w-full lg:max-w-4xl mx-auto flex items-center justify-between px-4 lg:px-0 py-4 relative">
          <div className="flex items-center gap-3">
            <DashboardHeaderSection />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span
                  data-slot="avatar"
                  className="flex shrink-0 overflow-hidden rounded-full bg-bg-4 text-fg-2 w-7.5 h-7.5 text-sm"
                >
                  <img
                    alt=""
                    data-slot="avatar-image"
                    className="aspect-square size-full"
                    src="https://cdn.visitors.now/users/1ea471c2-f566-4f82-a62c-82ba30186efd/avatars/u4Xb--FTgczBo5xqA6aDz.jpg"
                  />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal text-xs">
                {currentTeam.name} team
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs">
                    Switch Team
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuGroup>
                      {teams.map((team) => (
                        <DropdownMenuItem
                          key={team.id}
                          className="cursor-pointer text-xs"
                          asChild
                        >
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
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem className="cursor-pointer text-xs">
                  New Team
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link
                    to="/$teamId/settings"
                    params={{ teamId }}
                    className="w-full text-xs"
                  >
                    Manage Team
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link
                    to="/$teamId/settings"
                    params={{ teamId }}
                    className="w-full text-xs"
                  >
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer text-xs" asChild>
                  <Link to="/" className="w-full">
                    Docs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs" asChild>
                  <Link to="/" className="w-full">
                    Support
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive text-xs"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
