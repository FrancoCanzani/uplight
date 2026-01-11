import { getRouteApi, Link, useLocation } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ActivityIcon } from "./motion/icons/activity";
import { BadgeAlertIcon } from "./motion/icons/badge-alert";
import { BellIcon } from "./motion/icons/bell";
import { HeartIcon } from "./motion/icons/heart";

const routeApi = getRouteApi("/(dashboard)/$teamId");

const sections = [
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
    path: "/$teamId/incidents",
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

export default function DashboardHeaderSection() {
  const { teamId } = routeApi.useParams();
  const location = useLocation();
  const locationArr = location.pathname.split("/");

  const currentSection = sections.find((section) =>
    locationArr.includes(section.routeSegment)
  );

  if (!currentSection) return null;

  const Icon = currentSection.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link
        to={currentSection.path}
        params={{ teamId }}
        className="flex items-center space-x-1.5 hover:opacity-80 transition-opacity"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex-1 text-xl"
        >
          {currentSection.name}
        </motion.span>
      </Link>
    </motion.div>
  );
}
