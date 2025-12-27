import { eq } from "drizzle-orm";
import { createDb } from "../../db";
import { checkResult, monitor } from "../../db/schema";
import { manageIncidents } from "./incident-manager";
import { sendNotifications } from "./notifier";
import type { CheckResult } from "../types";

type MonitorStatus =
  | "up"
  | "down"
  | "downgraded"
  | "maintenance"
  | "paused"
  | "initializing";

function resolveStatus(results: CheckResult[]): MonitorStatus {
  if (results.length === 0) return "initializing";

  const successCount = results.filter(
    (r) => r.result === "success" || r.result === "degraded"
  ).length;
  const degradedCount = results.filter((r) => r.result === "degraded").length;
  const failureCount = results.filter(
    (r) =>
      r.result === "failure" || r.result === "timeout" || r.result === "error"
  ).length;

  // All checks are successful (no degraded or failures)
  if (successCount === results.length && degradedCount === 0) return "up";
  // All checks failed
  if (failureCount === results.length) return "down";
  // Some checks are successful/degraded, some failed, or some are degraded
  return "downgraded";
}

function groupByMonitor(results: CheckResult[]): Map<number, CheckResult[]> {
  const grouped = new Map<number, CheckResult[]>();
  for (const result of results) {
    const existing = grouped.get(result.monitorId) ?? [];
    existing.push(result);
    grouped.set(result.monitorId, existing);
  }
  return grouped;
}

export async function processResults(
  results: CheckResult[],
  env: Env
): Promise<void> {
  if (results.length === 0) return;

  const db = createDb(env.DB);

  const byMonitor = groupByMonitor(results);

  // Process results for each monitor, checking response time thresholds
  for (const [monitorId, monitorResults] of byMonitor) {
    const [currentMonitor] = await db
      .select({
        status: monitor.status,
        name: monitor.name,
        teamId: monitor.teamId,
        responseTimeThreshold: monitor.responseTimeThreshold,
      })
      .from(monitor)
      .where(eq(monitor.id, monitorId))
      .limit(1);

    if (!currentMonitor) continue;

    // Mark successful checks as degraded if they exceed the threshold
    const processedResults = monitorResults.map((r) => {
      if (
        r.result === "success" &&
        currentMonitor.responseTimeThreshold !== null &&
        r.responseTime > currentMonitor.responseTimeThreshold
      ) {
        return {
          ...r,
          result: "degraded" as const,
          errorMessage:
            r.errorMessage ||
            `Response time ${r.responseTime}ms exceeds threshold of ${currentMonitor.responseTimeThreshold}ms`,
        };
      }
      return r;
    });

    const insertValues = processedResults.map((r) => ({
      monitorId: r.monitorId,
      location: r.location,
      result: r.result,
      responseTime: r.responseTime,
      statusCode: r.statusCode ?? null,
      errorMessage: r.errorMessage ?? null,
      responseHeaders:
        r.result !== "success" && r.result !== "degraded" && r.responseHeaders
          ? JSON.stringify(r.responseHeaders)
          : null,
      responseBody:
        r.result !== "success" && r.result !== "degraded"
          ? (r.responseBody ?? null)
          : null,
      retryCount: r.retryCount,
      checkedAt: new Date(r.checkedAt),
    }));

    await db.insert(checkResult).values(insertValues);

    const newStatus = resolveStatus(processedResults);
    const oldStatus = currentMonitor.status;

    await db
      .update(monitor)
      .set({ status: newStatus })
      .where(eq(monitor.id, monitorId));

    const incidentEvents = await manageIncidents(
      monitorId,
      processedResults,
      env
    );

    await sendNotifications({
      monitorId,
      monitorName: currentMonitor.name,
      teamId: currentMonitor.teamId,
      oldStatus,
      newStatus,
      results: processedResults,
      incidentEvents,
    });
  }
}
