export function getStatusColorSvg(status: string): string {
  switch (status) {
    case "up":
    case "success":
      return "#15803d";
    case "down":
    case "failure":
      return "#b91c1c";
    case "degraded":
      return "#b45309";
    case "timeout":
      return "#c2410c";
    case "maintenance":
      return "#1d4ed8";
    case "paused":
      return "#475569";
    case "initializing":
      return "#334155";
    default:
      return "#334155";
  }
}
