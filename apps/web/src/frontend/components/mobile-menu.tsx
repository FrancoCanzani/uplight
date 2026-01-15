import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded p-1 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Menu className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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
                <Check className="size-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer gap-2">
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
              <Users className="size-4 text-muted-foreground" />
              <span>Manage team</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer gap-2">
            <Link
              to="/$teamId/new-team"
              params={{ teamId }}
              className="w-full flex items-center gap-2"
            >
              <Plus className="size-4 text-muted-foreground" />
              <span>Create new team</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.segment && locationArr.includes(item.segment);
            return (
              <DropdownMenuItem
                key={item.path}
                asChild
                className="cursor-pointer gap-2"
              >
                <Link
                  to={item.path}
                  params={{ teamId }}
                  className={cn(
                    "w-full flex items-center gap-2",
                    isActive && "bg-muted",
                  )}
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="size-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
