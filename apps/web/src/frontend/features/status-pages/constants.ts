export {
  getOverallStatusLabel,
  getOverallStatusTextColor,
  getStatusBgColor,
  getStatusLabel,
  MONITOR_STATUS_CONFIG,
  OVERALL_STATUS_CONFIG,
} from "@/lib/constants/status";

// Legacy exports for backward compatibility
export const OVERALL_STATUS_LABELS = {
  operational: "All Systems Operational",
  degraded: "Partial System Outage",
  outage: "Major System Outage",
} as const;

export const OVERALL_STATUS_COLORS = {
  operational: "text-green-600",
  degraded: "text-yellow-600",
  outage: "text-red-600",
} as const;

export const MONITOR_STATUS_LABELS = {
  up: "Operational",
  down: "Down",
  degraded: "Degraded",
  maintenance: "Maintenance",
  paused: "Paused",
  initializing: "Initializing",
} as const;

export const MONITOR_STATUS_COLORS = {
  up: "bg-green-500",
  down: "bg-red-500",
  degraded: "bg-yellow-500",
  maintenance: "bg-blue-500",
  paused: "bg-gray-500",
  initializing: "bg-gray-400",
} as const;
