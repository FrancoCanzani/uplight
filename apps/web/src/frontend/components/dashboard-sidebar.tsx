import { getRouteApi, Link, useLocation } from "@tanstack/react-router";
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
import { cn } from "@/lib/utils";
import { ActivityIcon } from "./motion/icons/activity";
import { BadgeAlertIcon } from "./motion/icons/badge-alert";
import { BellIcon } from "./motion/icons/bell";
import { FileTextIcon } from "./motion/icons/file-text";
import { HeartIcon } from "./motion/icons/heart";
import { LayoutPanelTopIcon } from "./motion/icons/layout-panel-top";
import { MessageSquareIcon } from "./motion/icons/message-square";
import { SettingsIcon } from "./motion/icons/settings";

const routeApi = getRouteApi("/(dashboard)/$teamId");

export function DashboardSidebar() {
  const { currentTeam } = routeApi.useLoaderData();
  const teamId = currentTeam.id.toString();

  const location = useLocation();
  const locationArr = location.pathname.split("/");

  return (
    <Sidebar
      collapsible="none"
      className="hidden md:flex border-r border-r-border/30"
    >
      <SidebarHeader className="h-14 p-0">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="py-2">
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
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
                    locationArr.includes("heartbeats") && "bg-sidebar-accent",
                  )}
                >
                  <Link
                    className="w-full flex items-center gap-x-2 text-base font-light"
                    to="/$teamId/heartbeats"
                    params={{ teamId }}
                  >
                    <HeartIcon />
                    Heartbeats
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
                    locationArr.includes("status-pages") && "bg-sidebar-accent",
                  )}
                >
                  <Link
                    className="w-full flex items-center gap-x-2 text-base font-light"
                    to="/$teamId/status-pages"
                    params={{ teamId }}
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
                  <Link
                    className="w-full flex items-center gap-x-2 text-base font-light"
                    to="/$teamId/notifications"
                    params={{ teamId }}
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
            <SidebarMenuButton
              className={cn(
                "",
                locationArr.includes("support") && "bg-sidebar-accent",
              )}
            >
              <Link
                className="w-full flex items-center gap-x-2 text-base font-light"
                to="/$teamId/support"
                params={{ teamId }}
              >
                <MessageSquareIcon />
                Support
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
