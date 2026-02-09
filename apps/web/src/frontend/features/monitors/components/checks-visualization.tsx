import { cn } from "@lib/utils";
import type { RecentCheck } from "../schemas";

export default function ChecksVisualization({
  checks,
  maxChecks = 100,
  isLoading = false,
}: {
  checks: RecentCheck[] | null;
  maxChecks?: number;
  isLoading?: boolean;
}) {
  if (!checks || checks.length === 0) {
    return (
      <div
        className="flex gap-0.5 h-4 overflow-hidden"
        role="img"
        aria-label={isLoading ? "Loading check results" : "No check results available"}
      >
        {Array.from({ length: maxChecks }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 bg-muted",
              isLoading && "animate-pulse",
            )}
            style={{ minWidth: "1px" }}
            aria-hidden="true"
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

  const successCount = displayChecks.filter(
    (check) =>
      check.result === "success" || check.result === "maintenance",
  ).length;
  const failureCount = displayChecks.length - successCount;

  return (
    <div
      className="flex gap-0.5 h-4"
      role="img"
      aria-label={
        isLoading
          ? "Loading check results"
          : `${displayChecks.length} recent checks: ${successCount} successful, ${failureCount} failed`
      }
    >
      {paddedChecks.map((check, i) => {
        if (!check) {
          return (
            <div
              key={i}
              className={cn(
                "flex-1 bg-muted",
                isLoading && "animate-pulse",
              )}
              style={{ minWidth: "1px" }}
              aria-hidden="true"
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
              isLoading && "animate-pulse",
            )}
            style={{ minWidth: "1px" }}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
