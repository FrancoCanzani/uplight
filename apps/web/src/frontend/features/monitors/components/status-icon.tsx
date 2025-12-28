import { MonitorStatus } from "@/features/monitors/schemas";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wrench,
  Pause,
  Loader2,
} from "lucide-react";

const config = {
  up: { icon: CheckCircle2, color: "text-emerald-500" },
  down: { icon: XCircle, color: "text-destructive" },
  degraded: { icon: AlertTriangle, color: "text-amber-500" },
  maintenance: { icon: Wrench, color: "text-muted-foreground" },
  paused: { icon: Pause, color: "text-muted-foreground" },
  initializing: { icon: Loader2, color: "text-muted-foreground animate-spin" },
} as const;

export default function StatusIcon({
  status,
  className,
}: {
  status: MonitorStatus;
  className?: string;
}) {
  const { icon: Icon, color } = config[status];
  return <Icon className={cn("size-4", color, className)} />;
}
