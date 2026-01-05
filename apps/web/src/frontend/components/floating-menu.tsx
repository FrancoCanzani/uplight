import { cn } from "@/lib/utils";
import { getRouteApi, Link, useLocation } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ActivityIcon } from "./motion/icons/activity";
import { BadgeAlertIcon } from "./motion/icons/badge-alert";
import { BellIcon } from "./motion/icons/bell";
import { HeartIcon } from "./motion/icons/heart";

export default function FloatingMenu() {
  const routeApi = getRouteApi("/(dashboard)/$teamId");
  const { teamId } = routeApi.useParams();
  const location = useLocation();

  const locationArr = location.pathname.split("/");

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const items = [
    {
      icon: ActivityIcon,
      path: "/$teamId/monitors",
      name: "Monitors",
      routeSegment: "monitors",
    },
    {
      icon: HeartIcon,
      path: "/$teamId/heartbeats",
      name: "Heartbeats",
      routeSegment: "heartbeats",
    },
    {
      icon: BadgeAlertIcon,
      path: "/$teamId/incidents/kanban",
      name: "Incidents",
      routeSegment: "incidents",
    },
    {
      icon: BellIcon,
      path: "/$teamId/notifications",
      name: "Notifications",
      routeSegment: "notifications",
    },
  ];

  return (
    <motion.div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-background border border-border/50 shadow-xs flex items-center justify-center space-x-4 p-1 rounded-full">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = locationArr.includes(item.routeSegment);
        return (
          <motion.div
            key={index}
            whileHover={{
              scale: 1.2,
              transition: { duration: 1 },
            }}
            onHoverStart={() => setHoveredIndex(index)}
            className={cn(
              "cursor-pointer p-2 rounded-full text-muted-foreground  z-10",
              hoveredIndex === index && "bg-purple-50 text-foreground",
              isActive && "bg-sidebar-accent text-foreground"
            )}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link to={item.path} params={{ teamId }}>
              <Icon size={20} />
              <motion.span className="sr-only">{item.name}</motion.span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
