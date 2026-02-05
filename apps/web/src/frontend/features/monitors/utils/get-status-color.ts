export function getBgStatusColor(status: string) {
  switch (status) {
    case "up":
    case "success":
      return "bg-up";
    case "down":
    case "failure":
      return "bg-down";
    case "degraded":
      return "bg-degraded";
    case "timeout":
      return "bg-orange-700";
    case "maintenance":
      return "bg-maintenance";
    case "paused":
      return "bg-paused";
    case "initializing":
      return "bg-initializing";
    default:
      return "bg-initializing";
  }
}

export function getTextStatusColor(status: string) {
  switch (status) {
    case "up":
    case "success":
      return "text-up";
    case "down":
    case "failure":
      return "text-down";
    case "degraded":
      return "text-degraded";
    case "timeout":
      return "text-orange-700 dark:text-orange-500";
    case "maintenance":
      return "text-maintenance";
    case "paused":
      return "text-paused";
    case "initializing":
      return "text-initializing";
    default:
      return "text-initializing";
  }
}
