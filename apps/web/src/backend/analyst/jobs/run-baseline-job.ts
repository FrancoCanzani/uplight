import { and, eq, gte, ne } from "drizzle-orm";
import { createDb } from "../../db";
import { checkResult, monitor, monitorBaseline } from "../../db/schema";

const BASELINE_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
const ERROR_RESULTS = new Set(["failure", "timeout", "error"]);

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
}

export async function runBaselineJob(env: Env): Promise<void> {
  const db = createDb(env.DB);
  const nowMs = Date.now();
  const cutoff = new Date(nowMs - BASELINE_LOOKBACK_MS);

  const monitors = await db
    .select({ id: monitor.id, name: monitor.name })
    .from(monitor)
    .where(ne(monitor.status, "paused"));

  if (monitors.length === 0) {
    console.log("[ANALYST][BASELINE] No active monitors");
    return;
  }

  let computed = 0;

  for (const mon of monitors) {
    const metrics = await db
      .select({
        responseTime: checkResult.responseTime,
        result: checkResult.result,
      })
      .from(checkResult)
      .where(
        and(
          eq(checkResult.monitorId, mon.id),
          gte(checkResult.checkedAt, cutoff),
        ),
      );

    const relevantMetrics = metrics.filter((m) => m.result !== "maintenance");
    if (relevantMetrics.length === 0) {
      continue;
    }

    const responseTimes = relevantMetrics
      .map((m) => m.responseTime)
      .filter((value) => value > 0);

    const errorCount = relevantMetrics.filter((m) =>
      ERROR_RESULTS.has(m.result),
    ).length;

    const baselineValues = {
      monitorId: mon.id,
      avgResponseMs: responseTimes.length > 0 ? avg(responseTimes) : 0,
      p95ResponseMs: responseTimes.length > 0 ? percentile(responseTimes, 95) : 0,
      avgErrorRate: errorCount / relevantMetrics.length,
      computedAt: new Date(nowMs),
      sampleCount: relevantMetrics.length,
    };

    await db
      .insert(monitorBaseline)
      .values(baselineValues)
      .onConflictDoUpdate({
        target: monitorBaseline.monitorId,
        set: {
          avgResponseMs: baselineValues.avgResponseMs,
          p95ResponseMs: baselineValues.p95ResponseMs,
          avgErrorRate: baselineValues.avgErrorRate,
          computedAt: baselineValues.computedAt,
          sampleCount: baselineValues.sampleCount,
        },
      });

    computed++;
  }

  console.log(
    `[ANALYST][BASELINE] Computed baselines for ${computed}/${monitors.length} monitors`,
  );
}
