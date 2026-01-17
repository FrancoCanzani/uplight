import type { MonitorStatus } from "../schemas";

export function mapCheckStatusToMonitorStatus(
  checkResult: string,
): MonitorStatus {
  switch (checkResult) {
    case "success":
      return "up";
    case "failure":
    case "timeout":
    case "error":
      return "down";
    case "degraded":
      return "degraded";
    case "maintenance":
      return "maintenance";
    default:
      return "initializing";
  }
}
