import { cn } from "@lib/utils";
import type { RecentCheck } from "../schemas";

export default function ChecksVisualization({
  checks,
  maxChecks = 100,
}: {
  checks: RecentCheck[] | null;
  maxChecks?: number;
}) {
  if (!checks || checks.length === 0) {
    return (
      <div className="flex gap-0.5 h-2 overflow-hidden">
        {Array.from({ length: maxChecks }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-muted"
            style={{ minWidth: "2px" }}
          />
        ))}
      </div>
    );
  }

  const displayChecks = checks.slice(-maxChecks);
  const paddedChecks = Array.from({ length: maxChecks }, (_, i) => {
    const checkIndex = i - (maxChecks - displayChecks.length);
    return checkIndex >= 0 ? displayChecks[checkIndex] : null;
  });

  return (
    <div className="flex gap-0.5 h-4">
      {paddedChecks.map((check, i) => {
        if (!check) {
          return (
            <div
              key={i}
              className="flex-1 bg-muted"
              style={{ minWidth: "1px" }}
            />
          );
        }
        const isSuccess =
          check.result === "success" || check.result === "maintenance";

        return (
          <div
            key={i}
            className={cn(
              "flex-1 hover:scale-110",
              isSuccess ? "bg-up" : "bg-down",
            )}
            style={{ minWidth: "1px" }}
          />
        );
      })}
    </div>
  );
}
