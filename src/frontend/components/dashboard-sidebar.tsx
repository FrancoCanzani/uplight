import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/features/teams/components/team-switcher";
import { signOut } from "@/lib/auth/client";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";

const routeApi = getRouteApi("/(dashboard)/$teamId");

export function DashboardSidebar() {
  const { currentTeam } = routeApi.useLoaderData();
  const navigate = useNavigate();
  const teamId = currentTeam.id.toString();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link to="/$teamId/monitors" params={{ teamId }}>
                    Monitors
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link to="/$teamId/incidents" params={{ teamId }}>
                    Incidents
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link to="/$teamId/logs" params={{ teamId }}>
                    Check logs
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              Sign out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
