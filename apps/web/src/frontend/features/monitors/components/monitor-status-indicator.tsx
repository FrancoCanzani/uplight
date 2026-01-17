import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <Tooltip>
      <TooltipTrigger className="shrink-0">
        <div
          className={cn(
            "size-2 -full flex items-center justify-center",
            getBgStatusColor(status),
            className,
          )}
        >
          <div
            className={cn(
              "size-1.5 -full animate-ping",
              getBgStatusColor(status),
            )}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent className={"capitalize text-xs"}>{status}</TooltipContent>
    </Tooltip>
  );
}
