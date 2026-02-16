import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { AnalystFinding } from "../api/fetch-findings";

function severityBadgeClass(severity: AnalystFinding["severity"]): string {
  switch (severity) {
    case "critical":
      return "border-red-300 bg-red-50 text-red-700";
    case "warning":
      return "border-orange-300 bg-orange-50 text-orange-700";
    case "watch":
      return "border-amber-300 bg-amber-50 text-amber-700";
    case "predicted":
      return "border-blue-300 bg-blue-50 text-blue-700";
    default:
      return "border-muted bg-muted/20 text-muted-foreground";
  }
}

function predictionProbability(
  prediction: Record<string, unknown> | null,
): number | null {
  if (!prediction) return null;
  const raw = prediction.failure_probability;
  if (typeof raw !== "number") return null;
  return Math.round(raw * 100);
}

export default function AnalystFindingsTimeline({
  findings,
}: {
  findings: AnalystFinding[];
}) {
  if (findings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Analyst Findings</h3>
      <div className="space-y-2">
        {findings.slice(0, 10).map((finding) => {
          const probability = predictionProbability(finding.prediction);
          return (
            <div
              key={finding.id}
              className="border border-border/50 rounded-md p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={severityBadgeClass(finding.severity)}
                  >
                    {finding.severity}
                  </Badge>
                  {probability !== null && (
                    <span className="text-xs text-muted-foreground">
                      {probability}% failure risk
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(finding.createdAt, { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">
                {finding.summary ?? "No summary provided by analyst."}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
