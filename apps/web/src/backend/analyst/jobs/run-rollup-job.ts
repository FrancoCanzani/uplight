import { and, gte, lt } from "drizzle-orm";
import { createDb } from "../../db";
import { checkResult, metricHourly } from "../../db/schema";

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

function getPreviousHourWindow(now: Date): { start: Date; end: Date } {
  const end = new Date(now);
  end.setMinutes(0, 0, 0);
  const start = new Date(end);
  start.setHours(end.getHours() - 1);
  return { start, end };
}

export async function runRollupJob(env: Env): Promise<void> {
  const db = createDb(env.DB);
  const { start, end } = getPreviousHourWindow(new Date());

  const rows = await db
    .select({
      monitorId: checkResult.monitorId,
      location: checkResult.location,
      result: checkResult.result,
      responseTime: checkResult.responseTime,
    })
    .from(checkResult)
    .where(and(gte(checkResult.checkedAt, start), lt(checkResult.checkedAt, end)));

  if (rows.length === 0) {
    console.log(
      `[ANALYST][ROLLUP] No check results found for window ${start.toISOString()} - ${end.toISOString()}`,
    );
    return;
  }

  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.monitorId}:${row.location}`;
    const current = grouped.get(key) ?? [];
    current.push(row);
    grouped.set(key, current);
  }

  let upserts = 0;

  for (const [key, group] of grouped.entries()) {
    const [monitorIdRaw, location] = key.split(":");
    const monitorId = Number(monitorIdRaw);

    const relevant = group.filter((row) => row.result !== "maintenance");
    const responseTimes = relevant
      .map((row) => row.responseTime)
      .filter((value) => value > 0);
    const errorCount = relevant.filter((row) =>
      ERROR_RESULTS.has(row.result),
    ).length;

    const values = {
      monitorId,
      location,
      hour: new Date(start),
      avgResponseMs: responseTimes.length > 0 ? avg(responseTimes) : 0,
      p95ResponseMs: responseTimes.length > 0 ? percentile(responseTimes, 95) : 0,
      errorRate: relevant.length > 0 ? errorCount / relevant.length : 0,
      checkCount: relevant.length,
    };

    await db
      .insert(metricHourly)
      .values(values)
      .onConflictDoUpdate({
        target: [metricHourly.monitorId, metricHourly.location, metricHourly.hour],
        set: {
          avgResponseMs: values.avgResponseMs,
          p95ResponseMs: values.p95ResponseMs,
          errorRate: values.errorRate,
          checkCount: values.checkCount,
        },
      });

    upserts++;
  }

  console.log(
    `[ANALYST][ROLLUP] Upserted ${upserts} hourly rollups for ${start.toISOString()}`,
  );
}
