export default function getStatusColor(status: string) {
  switch (status) {
    case "up":
    case "success":
      return "bg-emerald-500";
    case "down":
    case "failure":
      return "bg-red-500";
    case "degraded":
      return "bg-amber-500";
    case "timeout":
      return "bg-orange-500";
    case "maintenance":
      return "bg-blue-500";
    case "initializing":
      return "bg-slate-400";
    default:
      return "bg-slate-500";
  }
}
