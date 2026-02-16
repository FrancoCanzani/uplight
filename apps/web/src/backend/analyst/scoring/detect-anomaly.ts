type MetricResult =
  | "success"
  | "failure"
  | "timeout"
  | "error"
  | "maintenance"
  | "degraded";

export interface AnalystMetric {
  responseTime: number;
  result: MetricResult;
  checkedAtMs: number;
}

export interface MonitorBaselineSnapshot {
  avgResponseMs: number;
  p95ResponseMs: number;
  avgErrorRate: number;
}

interface TrendResult {
  direction: "degrading" | "stable" | "improving";
  confidence: number;
}

export interface AnomalyDetectionResult {
  score: number;
  signals: string[];
}

const ERROR_RESULTS = new Set<MetricResult>(["failure", "timeout", "error"]);

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function computeErrorRate(metrics: AnalystMetric[]): number {
  const relevant = metrics.filter((m) => m.result !== "maintenance");
  if (relevant.length === 0) return 0;
  const errors = relevant.filter((m) => ERROR_RESULTS.has(m.result)).length;
  return errors / relevant.length;
}

function computeTrend(metrics: AnalystMetric[]): TrendResult {
  if (metrics.length < 20) {
    return { direction: "stable", confidence: 0 };
  }

  const sorted = [...metrics].sort((a, b) => a.checkedAtMs - b.checkedAtMs);
  const latestTs = sorted[sorted.length - 1]?.checkedAtMs;
  if (!latestTs) return { direction: "stable", confidence: 0 };

  const thirtyMinutesAgo = latestTs - 30 * 60 * 1000;
  const twoHoursAgo = latestTs - 120 * 60 * 1000;

  const recent = sorted.filter(
    (m) => m.checkedAtMs > thirtyMinutesAgo && m.result !== "maintenance",
  );
  const prior = sorted.filter(
    (m) =>
      m.checkedAtMs > twoHoursAgo &&
      m.checkedAtMs <= thirtyMinutesAgo &&
      m.result !== "maintenance",
  );

  if (recent.length < 5 || prior.length < 10) {
    return { direction: "stable", confidence: 0 };
  }

  const recentAvg = avg(recent.map((m) => m.responseTime).filter((ms) => ms > 0));
  const priorAvg = avg(prior.map((m) => m.responseTime).filter((ms) => ms > 0));

  if (recentAvg === 0 || priorAvg === 0) {
    return { direction: "stable", confidence: 0 };
  }

  const ratio = recentAvg / priorAvg;

  if (ratio >= 1.25) {
    return {
      direction: "degrading",
      confidence: Math.min((ratio - 1) * 2, 1),
    };
  }

  if (ratio <= 0.85) {
    return {
      direction: "improving",
      confidence: Math.min((1 - ratio) * 2, 1),
    };
  }

  return { direction: "stable", confidence: 0.5 };
}

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function detectAnomaly(
  metrics: AnalystMetric[],
  baseline: MonitorBaselineSnapshot,
): AnomalyDetectionResult {
  const signals: string[] = [];
  let score = 0;

  const recentAvg = avg(metrics.map((m) => m.responseTime).filter((ms) => ms > 0));
  const recentErrRate = computeErrorRate(metrics);

  if (baseline.p95ResponseMs > 0 && recentAvg > baseline.p95ResponseMs * 1.3) {
    score += 0.4;
    signals.push(
      `Latency ${Math.round(recentAvg)}ms vs baseline p95 ${Math.round(baseline.p95ResponseMs)}ms`,
    );
  }

  if (
    baseline.avgErrorRate >= 0 &&
    recentErrRate > Math.max(baseline.avgErrorRate * 3, 0) &&
    recentErrRate > 0.02
  ) {
    score += 0.5;
    signals.push(
      `Error rate ${pct(recentErrRate)} vs baseline ${pct(baseline.avgErrorRate)}`,
    );
  }

  const trend = computeTrend(metrics);
  if (trend.direction === "degrading" && trend.confidence > 0.7) {
    score += 0.3;
    signals.push("Consistent degradation trend over last 2 hours");
  }

  return { score: Math.min(score, 1), signals };
}
