import { eq } from "drizzle-orm";
import { createDb } from "../db";
import { checkResult, monitor } from "../db/schema";
import { manageIncidents } from "./incident-manager";
import { sendNotifications } from "./notifier";
import type { CheckResult } from "./types";

type MonitorStatus =
  | "up"
  | "down"
  | "downgraded"
  | "maintenance"
  | "paused"
  | "initializing";

function resolveStatus(results: CheckResult[]): MonitorStatus {
  if (results.length === 0) return "initializing";

  const successCount = results.filter((r) => r.result === "success").length;

  if (successCount === results.length) return "up";
  if (successCount === 0) return "down";
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

  const insertValues = results.map((r) => ({
    monitorId: r.monitorId,
    location: r.location,
    result: r.result,
    responseTime: r.responseTime,
    statusCode: r.statusCode ?? null,
    errorMessage: r.errorMessage ?? null,
    responseHeaders:
      r.result !== "success" && r.responseHeaders
        ? JSON.stringify(r.responseHeaders)
        : null,
    responseBody: r.result !== "success" ? (r.responseBody ?? null) : null,
    retryCount: r.retryCount,
    checkedAt: new Date(r.checkedAt),
  }));

  await db.insert(checkResult).values(insertValues);

  const byMonitor = groupByMonitor(results);

  for (const [monitorId, monitorResults] of byMonitor) {
    const newStatus = resolveStatus(monitorResults);

    const [currentMonitor] = await db
      .select({
        status: monitor.status,
        name: monitor.name,
        teamId: monitor.teamId,
      })
      .from(monitor)
      .where(eq(monitor.id, monitorId))
      .limit(1);

    if (!currentMonitor) continue;

    const oldStatus = currentMonitor.status;

    await db
      .update(monitor)
      .set({ status: newStatus })
      .where(eq(monitor.id, monitorId));

    const incidentEvents = await manageIncidents(
      monitorId,
      monitorResults,
      env
    );

    await sendNotifications({
      monitorId,
      monitorName: currentMonitor.name,
      teamId: currentMonitor.teamId,
      oldStatus,
      newStatus,
      results: monitorResults,
      incidentEvents,
    });
  }
}
