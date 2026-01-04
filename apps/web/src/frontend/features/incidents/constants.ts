import type { IncidentSeverity, IncidentStatus } from "./types";

export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  low: "text-blue-700",
  medium: "text-yellow-700",
  high: "text-orange-700",
  critical: "text-red-700",
};

export const STATUS_TEXT_COLORS: Record<IncidentStatus, string> = {
  active: "text-red-700",
  acknowledged: "text-yellow-700",
  fixing: "text-blue-700",
  resolved: "text-green-700",
  ongoing: "text-red-700",
};
