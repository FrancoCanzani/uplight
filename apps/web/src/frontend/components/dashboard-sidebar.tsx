import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/features/teams/components/team-switcher";
import { signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import {
  getRouteApi,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { ActivityIcon } from "./motion/icons/activity";
import { BadgeAlertIcon } from "./motion/icons/badge-alert";
import { BellIcon } from "./motion/icons/bell";
import { FileTextIcon } from "./motion/icons/file-text";
import { GalleryVerticalEndIcon } from "./motion/icons/gallery-vertical-end";
import { LayoutPanelTopIcon } from "./motion/icons/layout-panel-top";
import { LogoutIcon } from "./motion/icons/logout";
import { MessageSquareIcon } from "./motion/icons/message-square";
import { SettingsIcon } from "./motion/icons/settings";

const routeApi = getRouteApi("/(dashboard)/$teamId");

export function DashboardSidebar() {
  const { currentTeam } = routeApi.useLoaderData();
  const navigate = useNavigate();
  const teamId = currentTeam.id.toString();

  const location = useLocation();

  const locationArr = location.pathname.split("/");

  console.log(locationArr.includes("monitors"));

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(
                    "",
                    locationArr.includes("monitors") && "bg-sidebar-accent",
                  )}
                >
                  <Link
                    className="w-full flex items-center gap-x-2 text-base font-light"
                    to="/$teamId/monitors"
                    params={{ teamId }}
                  >
                    <ActivityIcon />
                    Monitors
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(
                    "",
                    locationArr.includes("incidents") && "bg-sidebar-accent",
                  )}
                >
                  {" "}
                  <Link
                    className="w-full flex items-center gap-x-2 text-base font-light"
                    to="/$teamId/incidents"
                    params={{ teamId }}
                  >
                    <BadgeAlertIcon />
                    Incidents
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(
                    "",
                    locationArr.includes("logs") && "bg-sidebar-accent",
                  )}
                >
                  {" "}
                  <Link
                    className="w-full flex items-center gap-x-2 text-base font-light"
                    to="/$teamId/logs"
                    params={{ teamId }}
                  >
                    <GalleryVerticalEndIcon />
                    Logs
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link
                    className="w-full flex items-center gap-x-2 text-base font-light"
                    to="/"
                  >
                    <LayoutPanelTopIcon />
                    Status Pages
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(
                    "",
                    locationArr.includes("notifications") &&
                      "bg-sidebar-accent",
                  )}
                >
                  {" "}
                  <Link
                    className="w-full flex items-center gap-x-2 text-base font-light"
                    to="/"
                  >
                    <BellIcon />
                    Notifications
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
            <SidebarMenuButton>
              <Link
                className="w-full flex items-center gap-x-2 text-base font-light"
                to="/"
              >
                <FileTextIcon />
                Docs
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(
                "",
                locationArr.includes("settings") && "bg-sidebar-accent",
              )}
            >
              <Link
                className="w-full flex items-center gap-x-2 text-base font-light"
                to="/$teamId/settings"
                params={{ teamId: teamId }}
              >
                <SettingsIcon />
                Settings
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Link
                className="w-full flex items-center gap-x-2 text-base font-light"
                to="/"
              >
                <MessageSquareIcon />
                Support
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full flex items-center gap-x-2 text-base font-light"
              onClick={handleSignOut}
            >
              <LogoutIcon />
              Sign out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
