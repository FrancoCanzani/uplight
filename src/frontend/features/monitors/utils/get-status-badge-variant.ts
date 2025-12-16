export default function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "up":
      return "default" as const;
    case "down":
      return "destructive" as const;
    case "degraded":
      return "outline" as const;
    case "maintenance":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}
