export function getBgStatusColor(status: string) {
  switch (status) {
    case "up":
    case "success":
      return "bg-green-700";
    case "down":
    case "failure":
      return "bg-red-700";
    case "degraded":
      return "bg-amber-700";
    case "timeout":
      return "bg-orange-700";
    case "maintenance":
      return "bg-blue-700";
    case "paused":
      return "bg-slate-600";
    case "initializing":
      return "bg-slate-700";
    default:
      return "bg-slate-700";
  }
}

export function getTextStatusColor(status: string) {
  switch (status) {
    case "up":
    case "success":
      return "text-green-700 dark:text-green-500";
    case "down":
    case "failure":
      return "text-red-700 dark:text-red-500";
    case "degraded":
      return "text-amber-700 dark:text-amber-500";
    case "timeout":
      return "text-orange-700 dark:text-orange-500";
    case "maintenance":
      return "text-blue-700 dark:text-blue-500";
    case "paused":
      return "text-slate-500 dark:text-slate-400";
    case "initializing":
      return "text-slate-500 dark:text-slate-400";
    default:
      return "text-slate-500 dark:text-slate-400";
  }
}
