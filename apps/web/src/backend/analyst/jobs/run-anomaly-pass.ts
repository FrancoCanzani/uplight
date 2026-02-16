import { and, desc, eq, gte, ne, notInArray } from "drizzle-orm";
import { createDb } from "../../db";
import {
  analystFinding,
  checkResult,
  incident,
  monitor,
  monitorBaseline,
} from "../../db/schema";
import { runAnalystModel } from "../model/run-analyst-model";
import { runCorrelationModel } from "../model/run-correlation-model";
import { dispatchAnalystNotification } from "../notifications/dispatch-analyst-notification";
import { getDegradedProviders } from "../repositories/provider-status-repo";
import { detectAnomaly, type AnalystMetric } from "../scoring/detect-anomaly";

const LOOKBACK_MS = 2 * 60 * 60 * 1000;
const CORRELATION_LOOKBACK_MS = 15 * 60 * 1000;
const ANALYSIS_COOLDOWN_MS = 15 * 60 * 1000;
const MIN_METRICS = 10;
const MIN_SCORE_FOR_MODEL = 0.6;
const MIN_MONITORS_FOR_CORRELATION = 3;
const WARNING_NOTIFY_COOLDOWN_MS = 2 * 60 * 60 * 1000;
const CRITICAL_NOTIFY_COOLDOWN_MS = 30 * 60 * 1000;
const CORRELATION_NOTIFY_COOLDOWN_MS = 30 * 60 * 1000;
const SUMMARY_DEDUPE_WINDOW_MS = 6 * 60 * 60 * 1000;

type FindingSeverity =
  | "healthy"
  | "watch"
  | "warning"
  | "critical"
  | "predicted";

interface MonitorCandidate {
  monitor: {
    id: number;
    teamId: number;
    name: string;
    url: string | null;
  };
  rows: Array<{
    location: string;
    responseTime: number;
    result:
      | "success"
      | "failure"
      | "timeout"
      | "error"
      | "maintenance"
      | "degraded";
    checkedAt: Date;
  }>;
  metrics: AnalystMetric[];
  anomaly: {
    score: number;
    signals: string[];
  };
  baseline: {
    avgResponseMs: number;
    p95ResponseMs: number;
    avgErrorRate: number;
  };
}

interface CorrelationDecision {
  summary: string;
  reasoning: string;
  severity: "warning" | "critical";
  provider: string | null;
  notifiedForAnchor: boolean;
  anchorMonitorId: number;
  affectedLocations: string[];
}

function scoreToSeverity(score: number): "watch" | "warning" | "critical" {
  if (score >= 0.85) return "critical";
  if (score >= 0.7) return "warning";
  return "watch";
}

function getAffectedLocations(
  rows: Array<{
    location: string;
    result:
      | "success"
      | "failure"
      | "timeout"
      | "error"
      | "maintenance"
      | "degraded";
  }>,
): string[] {
  const failedLocations = rows
    .filter((row) => row.result !== "success" && row.result !== "maintenance")
    .map((row) => row.location);

  if (failedLocations.length > 0) {
    return [...new Set(failedLocations)];
  }

  return [...new Set(rows.map((row) => row.location))];
}

async function shouldNotifyFinding(
  env: Env,
  input: {
    monitorId: number;
    severity: FindingSeverity;
    summary: string;
  },
): Promise<boolean> {
  if (input.severity !== "warning" && input.severity !== "critical") {
    return false;
  }

  const db = createDb(env.DB);

  const [openIncident] = await db
    .select({ id: incident.id })
    .from(incident)
    .where(
      and(
        eq(incident.monitorId, input.monitorId),
        notInArray(incident.status, ["resolved", "recovered"]),
      ),
    )
    .limit(1);

  if (openIncident) {
    return false;
  }

  const nowMs = Date.now();
  const cooldownMs =
    input.severity === "critical"
      ? CRITICAL_NOTIFY_COOLDOWN_MS
      : WARNING_NOTIFY_COOLDOWN_MS;

  const [recentNotifiedBySeverity] = await db
    .select({ id: analystFinding.id })
    .from(analystFinding)
    .where(
      and(
        eq(analystFinding.monitorId, input.monitorId),
        eq(analystFinding.severity, input.severity),
        eq(analystFinding.notified, true),
        gte(analystFinding.createdAt, new Date(nowMs - cooldownMs)),
      ),
    )
    .orderBy(desc(analystFinding.createdAt))
    .limit(1);

  if (recentNotifiedBySeverity) {
    return false;
  }

  const [recentSameSummary] = await db
    .select({ id: analystFinding.id })
    .from(analystFinding)
    .where(
      and(
        eq(analystFinding.monitorId, input.monitorId),
        eq(analystFinding.summary, input.summary),
        eq(analystFinding.notified, true),
        gte(
          analystFinding.createdAt,
          new Date(nowMs - SUMMARY_DEDUPE_WINDOW_MS),
        ),
      ),
    )
    .orderBy(desc(analystFinding.createdAt))
    .limit(1);

  if (recentSameSummary) {
    return false;
  }

  return true;
}

async function shouldNotifyCorrelation(
  env: Env,
  input: {
    monitorId: number;
    summary: string;
  },
): Promise<boolean> {
  const db = createDb(env.DB);
  const nowMs = Date.now();

  const [recentSameSummary] = await db
    .select({ id: analystFinding.id })
    .from(analystFinding)
    .where(
      and(
        eq(analystFinding.monitorId, input.monitorId),
        eq(analystFinding.summary, input.summary),
        eq(analystFinding.notified, true),
        gte(
          analystFinding.createdAt,
          new Date(nowMs - CORRELATION_NOTIFY_COOLDOWN_MS),
        ),
      ),
    )
    .orderBy(desc(analystFinding.createdAt))
    .limit(1);

  return !recentSameSummary;
}

export async function runAnomalyPass(env: Env): Promise<void> {
  const db = createDb(env.DB);
  const nowMs = Date.now();
  const cutoff = new Date(nowMs - LOOKBACK_MS);

  const activeMonitors = await db
    .select({
      id: monitor.id,
      teamId: monitor.teamId,
      name: monitor.name,
      url: monitor.url,
    })
    .from(monitor)
    .where(ne(monitor.status, "paused"));

  if (activeMonitors.length === 0) {
    console.log("[ANALYST][ANOMALY] No active monitors");
    return;
  }

  const candidates: MonitorCandidate[] = [];

  for (const mon of activeMonitors) {
    const [lastFinding] = await db
      .select({ createdAt: analystFinding.createdAt })
      .from(analystFinding)
      .where(eq(analystFinding.monitorId, mon.id))
      .orderBy(desc(analystFinding.createdAt))
      .limit(1);

    if (
      lastFinding?.createdAt &&
      nowMs - lastFinding.createdAt.getTime() < ANALYSIS_COOLDOWN_MS
    ) {
      continue;
    }

    const [baseline] = await db
      .select()
      .from(monitorBaseline)
      .where(eq(monitorBaseline.monitorId, mon.id))
      .limit(1);

    if (!baseline || baseline.sampleCount < MIN_METRICS) {
      continue;
    }

    const rows = await db
      .select({
        location: checkResult.location,
        responseTime: checkResult.responseTime,
        result: checkResult.result,
        checkedAt: checkResult.checkedAt,
      })
      .from(checkResult)
      .where(
        and(
          eq(checkResult.monitorId, mon.id),
          gte(checkResult.checkedAt, cutoff),
        ),
      )
      .orderBy(desc(checkResult.checkedAt));

    if (rows.length < MIN_METRICS) {
      continue;
    }

    const metrics: AnalystMetric[] = rows.map((row) => ({
      responseTime: row.responseTime,
      result: row.result,
      checkedAtMs: row.checkedAt.getTime(),
    }));

    const anomaly = detectAnomaly(metrics, {
      avgResponseMs: baseline.avgResponseMs ?? 0,
      p95ResponseMs: baseline.p95ResponseMs ?? 0,
      avgErrorRate: baseline.avgErrorRate ?? 0,
    });

    if (anomaly.score < MIN_SCORE_FOR_MODEL) {
      continue;
    }

    candidates.push({
      monitor: mon,
      rows,
      metrics,
      anomaly,
      baseline: {
        avgResponseMs: baseline.avgResponseMs ?? 0,
        p95ResponseMs: baseline.p95ResponseMs ?? 0,
        avgErrorRate: baseline.avgErrorRate ?? 0,
      },
    });
  }

  if (candidates.length === 0) {
    console.log("[ANALYST][ANOMALY] No candidates above local score gate");
    return;
  }

  const candidatesByTeam = new Map<number, MonitorCandidate[]>();
  for (const candidate of candidates) {
    const teamCandidates = candidatesByTeam.get(candidate.monitor.teamId) ?? [];
    teamCandidates.push(candidate);
    candidatesByTeam.set(candidate.monitor.teamId, teamCandidates);
  }

  const correlationDecisionsByMonitor = new Map<number, CorrelationDecision>();
  let notificationsSent = 0;
  let correlationMatches = 0;
  let modelCalls = 0;
  let findingsCreated = 0;

  for (const [teamId, teamCandidates] of candidatesByTeam.entries()) {
    if (teamCandidates.length < MIN_MONITORS_FOR_CORRELATION) {
      continue;
    }

    const degradedProviders = await getDegradedProviders(
      env,
      CORRELATION_LOOKBACK_MS,
    );
    if (degradedProviders.length === 0) {
      continue;
    }

    try {
      const correlation = await runCorrelationModel(
        teamCandidates.map((candidate) => ({
          id: candidate.monitor.id,
          name: candidate.monitor.name,
          url: candidate.monitor.url,
          score: candidate.anomaly.score,
          signals: candidate.anomaly.signals,
        })),
        degradedProviders.map((provider) => ({
          provider: provider.provider,
          status: provider.status,
          description: provider.description,
          sinceMs: provider.sinceMs,
          sourceUrl: provider.sourceUrl,
        })),
      );

      if (!correlation.matched) {
        continue;
      }

      const anchor = teamCandidates[0];
      const providerLabel = correlation.provider ?? "a third-party provider";
      const summary =
        correlation.summary ||
        `Multi-monitor degradation appears correlated with ${providerLabel} status issues.`;
      const severity: "warning" | "critical" =
        correlation.confidence >= 0.85 ? "critical" : "warning";

      const affectedLocations = [
        ...new Set(
          teamCandidates.flatMap((candidate) =>
            getAffectedLocations(candidate.rows),
          ),
        ),
      ];

      const shouldNotify = await shouldNotifyCorrelation(env, {
        monitorId: anchor.monitor.id,
        summary,
      });

      if (shouldNotify) {
        await dispatchAnalystNotification(env, {
          teamId,
          monitorId: anchor.monitor.id,
          monitorName: anchor.monitor.name,
          severity,
          summary,
          signalHint: correlation.reasoning || null,
          locations: affectedLocations,
        });
        notificationsSent++;
      }

      for (const candidate of teamCandidates) {
        correlationDecisionsByMonitor.set(candidate.monitor.id, {
          summary,
          reasoning:
            correlation.reasoning ||
            "Pattern matches a provider-side incident.",
          severity,
          provider: correlation.provider ?? null,
          notifiedForAnchor:
            shouldNotify && candidate.monitor.id === anchor.monitor.id,
          anchorMonitorId: anchor.monitor.id,
          affectedLocations,
        });
      }

      correlationMatches++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[ANALYST][CORRELATION] Team ${teamId} correlation model failed: ${message}`,
      );
    }
  }

  for (const candidate of candidates) {
    const decision = correlationDecisionsByMonitor.get(candidate.monitor.id);

    if (decision) {
      await db.insert(analystFinding).values({
        id: crypto.randomUUID(),
        monitorId: candidate.monitor.id,
        createdAt: new Date(nowMs),
        severity: decision.severity,
        anomalies: JSON.stringify([
          { type: "correlation", description: decision.reasoning },
          ...candidate.anomaly.signals.map((signal) => ({
            type: "local",
            description: signal,
          })),
        ]),
        prediction: null,
        summary: decision.summary,
        notified: decision.notifiedForAnchor,
      });

      findingsCreated++;
      continue;
    }

    let severity: FindingSeverity = scoreToSeverity(candidate.anomaly.score);
    let anomalies = candidate.anomaly.signals.map((signal) => ({
      type: "local",
      description: signal,
    }));
    let prediction: {
      likely_outage: boolean;
      horizon: string;
      reasoning: string;
    } | null = null;
    let summary =
      candidate.anomaly.signals[0] ?? "Potential service degradation detected";

    try {
      const modelFinding = await runAnalystModel(
        { name: candidate.monitor.name, url: candidate.monitor.url },
        candidate.metrics,
        candidate.baseline,
        candidate.anomaly.signals,
      );

      modelCalls++;
      severity = modelFinding.severity;
      anomalies =
        modelFinding.anomalies.length > 0 ? modelFinding.anomalies : anomalies;
      prediction = modelFinding.prediction ?? null;
      summary = modelFinding.summary || summary;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[ANALYST][ANOMALY] Model call failed for monitor ${candidate.monitor.id}: ${message}`,
      );
    }

    const shouldNotify = await shouldNotifyFinding(env, {
      monitorId: candidate.monitor.id,
      severity,
      summary,
    });

    await db.insert(analystFinding).values({
      id: crypto.randomUUID(),
      monitorId: candidate.monitor.id,
      createdAt: new Date(nowMs),
      severity,
      anomalies: JSON.stringify(anomalies),
      prediction: prediction ? JSON.stringify(prediction) : null,
      summary,
      notified: shouldNotify,
    });
    findingsCreated++;

    if (shouldNotify) {
      await dispatchAnalystNotification(env, {
        teamId: candidate.monitor.teamId,
        monitorId: candidate.monitor.id,
        monitorName: candidate.monitor.name,
        severity,
        summary,
        signalHint: anomalies[0]?.description ?? null,
        locations: getAffectedLocations(candidate.rows),
      });

      notificationsSent++;
    }
  }

  console.log(
    `[ANALYST][ANOMALY] Completed pass. candidates=${candidates.length}, findings=${findingsCreated}, model_calls=${modelCalls}, correlation_matches=${correlationMatches}, notifications=${notificationsSent}`,
  );
}
