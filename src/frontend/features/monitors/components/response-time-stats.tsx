import { useMemo } from "react";
import type { CheckResult } from "../api/fetch-checks";

interface ResponseTimeStatsProps {
  checks: CheckResult[];
}

export default function ResponseTimeStats({ checks }: ResponseTimeStatsProps) {
  const stats = useMemo(() => {
    if (checks.length === 0) {
      return { avg: 0, min: 0, max: 0 };
    }

    const times = checks.map((c) => c.responseTime);
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const min = Math.min(...times);
    const max = Math.max(...times);

    return { avg, min, max };
  }, [checks]);

  return (
    <div className="flex items-center gap-8">
      <div>
        <p className="text-xs text-muted-foreground">Avg</p>
        <p className="text-lg font-semibold tabular-nums">{stats.avg}ms</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Min</p>
        <p className="text-lg font-semibold tabular-nums text-emerald-500">{stats.min}ms</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Max</p>
        <p className="text-lg font-semibold tabular-nums text-amber-500">{stats.max}ms</p>
      </div>
    </div>
  );
}

