import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number) {
  return format(new Date(timestamp), "MMM d, h:mm a");
}

export function formatDateShort(timestamp: number) {
  return format(new Date(timestamp), "MMM d");
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;

  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

export function formatCause(cause: string) {
  return cause.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export type MonitorStatus =
  | "up"
  | "down"
  | "degraded"
  | "maintenance"
  | "paused"
  | "initializing";

export type HeartbeatStatus = "up" | "down" | "paused" | "initializing";

export function getStatusBgColor(status: string): string {
  switch (status) {
    case "up":
      return "bg-emerald-600";
    case "down":
      return "bg-red-600";
    case "degraded":
      return "bg-orange-500";
    case "maintenance":
      return "bg-blue-500";
    case "paused":
      return "bg-zinc-400";
    case "initializing":
      return "bg-amber-500";
    default:
      return "bg-zinc-400";
  }
}

export function getStatusTextColor(status: string): string {
  switch (status) {
    case "up":
      return "text-emerald-600";
    case "down":
      return "text-red-600";
    case "degraded":
      return "text-orange-500";
    case "maintenance":
      return "text-blue-500";
    case "paused":
      return "text-zinc-500";
    case "initializing":
      return "text-amber-500";
    default:
      return "text-zinc-500";
  }
}
