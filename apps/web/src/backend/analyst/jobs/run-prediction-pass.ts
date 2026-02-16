import { and, desc, eq, gte, lte, ne } from "drizzle-orm";
import { createDb } from "../../db";
import {
  analystFinding,
  analystPredictionOutcome,
  checkResult,
  metricHourly,
  monitor,
} from "../../db/schema";
import { runPredictionModel } from "../model/run-prediction-model";
import { dispatchAnalystNotification } from "../notifications/dispatch-analyst-notification";

const MIN_HOURS_FOR_PREDICTION = 24 * 30;
const PREDICTION_LOOKBACK_7D_MS = 7 * 24 * 60 * 60 * 1000;
const RECENT_METRICS_24H_MS = 24 * 60 * 60 * 1000;
const PREDICTION_NOTIFY_THRESHOLD = 0.75;
const PREDICTION_NOTIFY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const OUTCOME_EVALUATION_BATCH = 200;
const FAILURE_RESULTS = new Set(["failure", "timeout", "error"]);

function horizonToMs(horizon: "1h" | "3h" | "6h"): number {
  if (horizon === "1h") return 60 * 60 * 1000;
  if (horizon === "3h") return 3 * 60 * 60 * 1000;
  return 6 * 60 * 60 * 1000;
}

function aggregateHourlyForPrediction(
  rows: Array<{
    hour: Date;
    avgResponseMs: number | null;
    p95ResponseMs: number | null;
    errorRate: number | null;
    checkCount: number;
  }>,
): Array<{
  hourMs: number;
  avgResponseMs: number;
  p95ResponseMs: number;
  errorRate: number;
  checkCount: number;
}> {
  const byHour = new Map<number, typeof rows>();
  for (const row of rows) {
    const hourMs = row.hour.getTime();
    const current = byHour.get(hourMs) ?? [];
    current.push(row);
    byHour.set(hourMs, current);
  }

  const result = Array.from(byHour.entries())
    .map(([hourMs, group]) => {
      const totalChecks = group.reduce((sum, item) => sum + item.checkCount, 0);
      if (totalChecks === 0) {
        return {
          hourMs,
          avgResponseMs: 0,
          p95ResponseMs: 0,
          errorRate: 0,
          checkCount: 0,
        };
      }

      const weightedAvg =
        group.reduce(
          (sum, item) => sum + (item.avgResponseMs ?? 0) * item.checkCount,
          0,
        ) / totalChecks;
      const maxP95 = Math.max(
        ...group.map((item) => item.p95ResponseMs ?? 0),
        0,
      );
      const weightedError =
        group.reduce(
          (sum, item) => sum + (item.errorRate ?? 0) * item.checkCount,
          0,
        ) / totalChecks;

      return {
        hourMs,
        avgResponseMs: weightedAvg,
        p95ResponseMs: maxP95,
        errorRate: weightedError,
        checkCount: totalChecks,
      };
    })
    .sort((a, b) => b.hourMs - a.hourMs);

  return result;
}

async function shouldNotifyPrediction(
  env: Env,
  monitorId: number,
  summary: string,
): Promise<boolean> {
  const db = createDb(env.DB);
  const cutoff = Date.now() - PREDICTION_NOTIFY_COOLDOWN_MS;
  const [recent] = await db
    .select({ id: analystFinding.id })
    .from(analystFinding)
    .where(
      and(
        eq(analystFinding.monitorId, monitorId),
        eq(analystFinding.severity, "predicted"),
        eq(analystFinding.notified, true),
        eq(analystFinding.summary, summary),
        gte(analystFinding.createdAt, new Date(cutoff)),
      ),
    )
    .orderBy(desc(analystFinding.createdAt))
    .limit(1);

  return !recent;
}

async function evaluateMaturedPredictionOutcomes(
  env: Env,
  nowMs: number,
): Promise<number> {
  const db = createDb(env.DB);
  const dueOutcomes = await db
    .select()
    .from(analystPredictionOutcome)
    .where(
      and(
        eq(analystPredictionOutcome.outcome, "pending"),
        lte(analystPredictionOutcome.evaluateAtMs, nowMs),
      ),
    )
    .limit(OUTCOME_EVALUATION_BATCH);

  let evaluatedCount = 0;

  for (const outcome of dueOutcomes) {
    const windowStart = new Date(outcome.predictedAtMs);
    const windowEnd = new Date(outcome.evaluateAtMs);

    const checks = await db
      .select({ result: checkResult.result })
      .from(checkResult)
      .where(
        and(
          eq(checkResult.monitorId, outcome.monitorId),
          gte(checkResult.checkedAt, windowStart),
          lte(checkResult.checkedAt, windowEnd),
        ),
      );

    const failureCount = checks.filter((check) =>
      FAILURE_RESULTS.has(check.result),
    ).length;
    const hit = failureCount > 0;

    await db
      .update(analystPredictionOutcome)
      .set({
        outcome: hit ? "hit" : "miss",
        evidence: JSON.stringify({
          check_count: checks.length,
          failure_count: failureCount,
          start_ms: outcome.predictedAtMs,
          end_ms: outcome.evaluateAtMs,
        }),
        evaluatedAtMs: nowMs,
      })
      .where(eq(analystPredictionOutcome.id, outcome.id));

    evaluatedCount++;
  }

  return evaluatedCount;
}

export async function runPredictionPass(env: Env): Promise<void> {
  const db = createDb(env.DB);
  const nowMs = Date.now();
  const outcomesEvaluated = await evaluateMaturedPredictionOutcomes(env, nowMs);
  const monitors = await db
    .select({
      id: monitor.id,
      teamId: monitor.teamId,
      name: monitor.name,
      url: monitor.url,
    })
    .from(monitor)
    .where(ne(monitor.status, "paused"));

  if (monitors.length === 0) {
    console.log("[ANALYST][PREDICTION] No active monitors");
    return;
  }

  let predictionCalls = 0;
  let findingsCreated = 0;
  let notificationsSent = 0;

  for (const mon of monitors) {
    const hourly30d = await db
      .select({
        hour: metricHourly.hour,
      })
      .from(metricHourly)
      .where(
        and(
          eq(metricHourly.monitorId, mon.id),
          gte(
            metricHourly.hour,
            new Date(nowMs - MIN_HOURS_FOR_PREDICTION * 60 * 60 * 1000),
          ),
        ),
      )
      .orderBy(desc(metricHourly.hour));

    const distinctHours = new Set(hourly30d.map((row) => row.hour.getTime()));
    if (distinctHours.size < MIN_HOURS_FOR_PREDICTION) {
      continue;
    }

    const hourly7dRows = await db
      .select({
        hour: metricHourly.hour,
        avgResponseMs: metricHourly.avgResponseMs,
        p95ResponseMs: metricHourly.p95ResponseMs,
        errorRate: metricHourly.errorRate,
        checkCount: metricHourly.checkCount,
      })
      .from(metricHourly)
      .where(
        and(
          eq(metricHourly.monitorId, mon.id),
          gte(metricHourly.hour, new Date(nowMs - PREDICTION_LOOKBACK_7D_MS)),
        ),
      )
      .orderBy(desc(metricHourly.hour));

    if (hourly7dRows.length < 24 * 3) {
      continue;
    }

    const recentMetricsRows = await db
      .select({
        checkedAt: checkResult.checkedAt,
        responseTime: checkResult.responseTime,
        result: checkResult.result,
      })
      .from(checkResult)
      .where(
        and(
          eq(checkResult.monitorId, mon.id),
          gte(checkResult.checkedAt, new Date(nowMs - RECENT_METRICS_24H_MS)),
        ),
      )
      .orderBy(desc(checkResult.checkedAt));

    if (recentMetricsRows.length < 24) {
      continue;
    }

    try {
      const prediction = await runPredictionModel(
        { name: mon.name, url: mon.url },
        aggregateHourlyForPrediction(hourly7dRows),
        recentMetricsRows.map((row) => ({
          checkedAtMs: row.checkedAt.getTime(),
          responseTime: row.responseTime,
          result: row.result,
        })),
      );
      predictionCalls++;

      if (prediction.failure_probability < 0.5) {
        continue;
      }

      const summary =
        prediction.summary?.trim() ||
        `Predicted outage risk ${Math.round(prediction.failure_probability * 100)}% within ${prediction.horizon}.`;

      const shouldNotify =
        prediction.failure_probability >= PREDICTION_NOTIFY_THRESHOLD &&
        (await shouldNotifyPrediction(env, mon.id, summary));

      const findingId = crypto.randomUUID();
      await db.insert(analystFinding).values({
        id: findingId,
        monitorId: mon.id,
        createdAt: new Date(nowMs),
        severity: "predicted",
        anomalies: JSON.stringify(
          prediction.signals.map((signal) => ({
            type: "prediction_signal",
            description: signal,
          })),
        ),
        prediction: JSON.stringify(prediction),
        summary,
        notified: shouldNotify,
      });
      findingsCreated++;

      await db.insert(analystPredictionOutcome).values({
        id: crypto.randomUUID(),
        findingId,
        monitorId: mon.id,
        predictedAtMs: nowMs,
        evaluateAtMs: nowMs + horizonToMs(prediction.horizon),
        horizon: prediction.horizon,
        failureProbability: prediction.failure_probability,
        outcome: "pending",
        evidence: null,
        evaluatedAtMs: null,
        createdAtMs: nowMs,
      });

      if (shouldNotify) {
        await dispatchAnalystNotification(env, {
          teamId: mon.teamId,
          monitorId: mon.id,
          monitorName: mon.name,
          severity: "predicted",
          summary,
          signalHint: prediction.reasoning,
          locations: [],
        });
        notificationsSent++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[ANALYST][PREDICTION] Prediction model failed for monitor ${mon.id}: ${message}`,
      );
    }
  }

  console.log(
    `[ANALYST][PREDICTION] Completed pass. calls=${predictionCalls}, findings=${findingsCreated}, notifications=${notificationsSent}, outcomes_evaluated=${outcomesEvaluated}`,
  );
}
