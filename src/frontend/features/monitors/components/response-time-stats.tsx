import { useMemo } from "react";
import type { CheckResult } from "../api/fetch-checks";

export default function ResponseTimeStats({
  checks,
}: {
  checks: CheckResult[];
}) {
  const stats = useMemo(() => {
    const times = checks
      .filter((c) => c.responseTime > 0)
      .map((c) => c.responseTime);

    if (times.length === 0) {
      return { avg: 0, min: 0, max: 0 };
    }

    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const min = Math.min(...times);
    const max = Math.max(...times);

    return { avg, min, max };
  }, [checks]);

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Avg</span>
        <span className="font-mono tabular-nums">{stats.avg}ms</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Min</span>
        <span className="font-mono tabular-nums">{stats.min}ms</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Max</span>
        <span className="font-mono tabular-nums">{stats.max}ms</span>
      </div>
    </div>
  );
}
