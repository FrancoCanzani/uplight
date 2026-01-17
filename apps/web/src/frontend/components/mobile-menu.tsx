import {
  getRouteApi,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import {
  Check,
  FileText,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const routeApi = getRouteApi("/(dashboard)/$teamId");

const menuItems = [
  { icon: FileText, path: "/", label: "Docs" },
  {
    icon: MessageSquare,
    path: "/$teamId/support",
    label: "Support",
    segment: "support",
  },
];

export function MobileMenu() {
  const { teams, currentTeam } = routeApi.useLoaderData();
  const teamId = currentTeam.id.toString();
  const navigate = useNavigate();
  const location = useLocation();
  const locationArr = location.pathname.split("/");

  const handleTeamSelect = (id: number) => {
    navigate({
      to: "/$teamId/monitors",
      params: { teamId: String(id) },
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-1 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Menu className="size-5" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Team management
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              className="cursor-pointer w-full flex items-center justify-between"
              onClick={() => handleTeamSelect(team.id)}
            >
              <span className="truncate text-xs">{team.name}</span>
              {team.id === currentTeam.id && (
                <Check className="size-3 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            render={
              <Link
                to="/$teamId/team"
                params={{ teamId }}
                className={cn(
                  "w-full flex items-center gap-2",
                  locationArr.includes("team") &&
                    !locationArr.includes("teams") &&
                    "bg-muted",
                )}
              >
                <Users className="size-3 text-muted-foreground" />
                <span>Manage team</span>
              </Link>
            }
            className="cursor-pointer gap-2"
          />
          <DropdownMenuItem
            render={
              <Link
                to="/$teamId/new-team"
                params={{ teamId }}
                className="w-full flex items-center gap-2"
              >
                <Plus className="size-3 text-muted-foreground" />
                <span>Create new team</span>
              </Link>
            }
            className="cursor-pointer gap-2"
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.segment && locationArr.includes(item.segment);
            return (
              <DropdownMenuItem
                key={item.path}
                render={
                  <Link
                    to={item.path}
                    params={{ teamId }}
                    className={cn(
                      "w-full flex items-center gap-2",
                      isActive && "bg-muted",
                    )}
                  >
                    <Icon className="size-3 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Link>
                }
                className="cursor-pointer gap-2"
              ></DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer gap-2 hover:text-destructive text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="size-3" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
