export type MonitorStatus =
  | "up"
  | "down"
  | "degraded"
  | "maintenance"
  | "paused"
  | "initializing";

export type HeartbeatStatus = "up" | "down" | "paused" | "initializing";

export type OverallStatus = "operational" | "degraded" | "outage";

// Monitor status display configuration
export const MONITOR_STATUS_CONFIG = {
  up: {
    label: "Operational",
    bgColor: "bg-up",
    textColor: "text-up",
  },
  down: {
    label: "Down",
    bgColor: "bg-down",
    textColor: "text-down",
  },
  degraded: {
    label: "Degraded",
    bgColor: "bg-degraded",
    textColor: "text-degraded",
  },
  maintenance: {
    label: "Maintenance",
    bgColor: "bg-maintenance",
    textColor: "text-maintenance",
  },
  paused: {
    label: "Paused",
    bgColor: "bg-paused",
    textColor: "text-paused",
  },
  initializing: {
    label: "Initializing",
    bgColor: "bg-initializing",
    textColor: "text-initializing",
  },
} as const;

// Overall system status for status pages
export const OVERALL_STATUS_CONFIG = {
  operational: {
    label: "All Systems Operational",
    textColor: "text-green-600",
  },
  degraded: {
    label: "Partial System Outage",
    textColor: "text-yellow-600",
  },
  outage: {
    label: "Major System Outage",
    textColor: "text-red-600",
  },
} as const;

// Helper functions for getting status colors
export function getStatusBgColor(status: string): string {
  const config = MONITOR_STATUS_CONFIG[status as MonitorStatus];
  return config?.bgColor ?? "bg-zinc-400";
}

export function getStatusTextColor(status: string): string {
  const config = MONITOR_STATUS_CONFIG[status as MonitorStatus];
  return config?.textColor ?? "text-zinc-500";
}

export function getStatusLabel(status: string): string {
  const config = MONITOR_STATUS_CONFIG[status as MonitorStatus];
  return config?.label ?? status;
}

export function getOverallStatusLabel(status: OverallStatus): string {
  return OVERALL_STATUS_CONFIG[status].label;
}

export function getOverallStatusTextColor(status: OverallStatus): string {
  return OVERALL_STATUS_CONFIG[status].textColor;
}
