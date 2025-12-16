import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

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
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

export function formatCause(cause: string) {
  return cause.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
