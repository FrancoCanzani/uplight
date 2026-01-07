import { cn } from "@/lib/utils";
import { MonitorStatus } from "../schemas";
import { getBgStatusColor } from "../utils/get-status-color";

export default function MonitorStatusIndicator({
  className,
  status,
}: {
  className?: string;
  status: MonitorStatus;
}) {
  return (
    <div className="shrink-0">
      <div
        className={cn(
          "size-2 rounded-full flex items-center justify-center",
          getBgStatusColor(status),
          className,
        )}
      >
        <div
          className={cn(
            "size-1.5 rounded-full animate-ping",
            getBgStatusColor(status),
          )}
        />
      </div>
    </div>
  );
}
