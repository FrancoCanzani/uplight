import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Wrench,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckResultIcon({
  result,
  className,
}: {
  result: string;
  className?: string;
}) {
  const baseClassName = cn("size-3.5", className);

  switch (result) {
    case "up":
    case "success":
      return <CheckCircle2 className={cn("text-green-700", baseClassName)} />;
    case "down":
    case "failure":
      return <XCircle className={cn("text-destructive", baseClassName)} />;
    case "degraded":
      return <AlertTriangle className={cn("text-amber-500", baseClassName)} />;
    case "timeout":
      return <Clock className={cn("text-orange-500", baseClassName)} />;
    case "maintenance":
      return <Wrench className={cn("text-blue-500", baseClassName)} />;
    case "initializing":
      return (
        <Loader2
          className={cn("text-muted-foreground animate-spin", baseClassName)}
        />
      );
    default:
      return <Circle className={cn("text-muted-foreground", baseClassName)} />;
  }
}
