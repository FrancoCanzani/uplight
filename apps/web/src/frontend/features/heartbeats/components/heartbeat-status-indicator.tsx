import { cn } from "@lib/utils";

function getStatusBgColor(status: string) {
  switch (status) {
    case "up":
      return "bg-green-700";
    case "down":
      return "bg-red-700";
    case "paused":
      return "bg-slate-600";
    case "initializing":
      return "bg-slate-700";
    default:
      return "bg-slate-700";
  }
}

export default function HeartbeatStatusIndicator({
  status,
}: {
  status: string;
}) {
  return (
    <div
      className={cn(
        "size-2 -full flex items-center justify-center",
        getStatusBgColor(status),
      )}
    >
      <div
        className={cn("size-1.5 -full animate-ping", getStatusBgColor(status))}
      />
    </div>
  );
}
