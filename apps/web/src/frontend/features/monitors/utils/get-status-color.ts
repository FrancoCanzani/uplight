export default function getStatusColor(status: string) {
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
    case "initializing":
      return "bg-slate-700";
    default:
      return "bg-slate-700";
  }
}
