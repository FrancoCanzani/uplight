import { getRouteApi, Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ActivityIcon } from "./motion/icons/activity";
import { BadgeAlertIcon } from "./motion/icons/badge-alert";
import { BellIcon } from "./motion/icons/bell";
import { EyeIcon } from "./motion/icons/eye";
import { HeartIcon } from "./motion/icons/heart";
import { LayoutPanelTopIcon } from "./motion/icons/layout-panel-top";
import { SettingsIcon } from "./motion/icons/settings";

const routeApi = getRouteApi("/(dashboard)/$teamId");

const navItems = [
  { icon: EyeIcon, path: "/$teamId", segment: "home" },
  { icon: ActivityIcon, path: "/$teamId/monitors", segment: "monitors" },
  { icon: HeartIcon, path: "/$teamId/heartbeats", segment: "heartbeats" },
  { icon: BadgeAlertIcon, path: "/$teamId/incidents", segment: "incidents" },
  {
    icon: LayoutPanelTopIcon,
    path: "/$teamId/status-pages",
    segment: "status-pages",
  },
  { icon: BellIcon, path: "/$teamId/notifications", segment: "notifications" },
];

export function BottomNav() {
  const { teamId } = routeApi.useParams();
  const location = useLocation();
  const locationArr = location.pathname.split("/");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50">
      <div className="flex items-center justify-around py-1.5 px-2 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = locationArr.includes(item.segment);
          return (
            <Link
              key={item.path}
              to={item.path}
              params={{ teamId }}
              className={cn(
                "p-2 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground/70",
              )}
            >
              <Icon size={16} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
