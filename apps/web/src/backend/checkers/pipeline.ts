import { eq } from "drizzle-orm";
import { createDb } from "../db";
import { checkResult, monitor } from "../db/schema";
import { dispatchIntegrations } from "../integrations/dispatcher";
import { decrypt } from "../lib/crypto";
import { manageIncidents } from "./incidents/manager";
import { sleep } from "./retry";
import type {
  CheckRequest,
  CheckResult,
  DnsAssertion,
  DnsRecordType,
  Location,
  MonitorRow,
} from "./types";

type MonitorStatus =
  | "up"
  | "down"
  | "degraded"
  | "maintenance"
  | "paused"
  | "initializing";

const LOCATION_HINTS: Record<Location, DurableObjectLocationHint> = {
  wnam: "wnam",
  enam: "enam",
  sam: "sam",
  weur: "weur",
  eeur: "eeur",
  apac: "apac",
  oc: "oc",
  afr: "afr",
  me: "me",
};

const DISPATCH_MAX_RETRIES = 2;
const DISPATCH_INITIAL_DELAY = 500;
const MAX_DISPATCH_CONCURRENCY = 20;
const DNS_RECORD_TYPES: DnsRecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
];

function parseDnsRecordTypes(value: string | null): DnsRecordType[] {
  if (!value) return ["A"];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter((item): item is DnsRecordType =>
        DNS_RECORD_TYPES.includes(item as DnsRecordType),
      );
      if (filtered.length > 0) return filtered;
    }
  } catch {
    if (DNS_RECORD_TYPES.includes(value as DnsRecordType)) {
      return [value as DnsRecordType];
    }
  }

  return ["A"];
}

function parseDnsAssertions(mon: MonitorRow): DnsAssertion[] {
  if (mon.dnsExpectedValue) {
    try {
      const parsed = JSON.parse(mon.dnsExpectedValue);
      if (Array.isArray(parsed)) {
        const assertions = parsed
          .filter(
            (item): item is DnsAssertion =>
              !!item &&
              typeof item === "object" &&
              DNS_RECORD_TYPES.includes(item.recordType as DnsRecordType) &&
              typeof item.value === "string" &&
              item.value.trim().length > 0,
          )
          .map((item) => ({
            recordType: item.recordType as DnsRecordType,
            value: item.value.trim(),
          }));
        if (assertions.length > 0) return assertions;
      }
    } catch {
      // Backward compatibility fallback below.
    }
  }

  const recordTypes = parseDnsRecordTypes(mon.dnsRecordType);
  const fallbackValue = mon.dnsExpectedValue?.trim() ?? "";

  return recordTypes.map((recordType) => ({
    recordType,
    value: fallbackValue,
  }));
}

function computeDispatchJitter(monitorId: number, location: string): number {
  // Deterministic jitter spreads bursts inside each cron run.
  const seed = `${monitorId}:${location}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 300;
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  if (tasks.length === 0) return [];

  const results = new Array<T>(tasks.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < tasks.length) {
      const index = cursor++;
      results[index] = await tasks[index]();
    }
  }

  const workerCount = Math.min(limit, tasks.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function buildCheckRequest(
  mon: MonitorRow,
  location: Location,
  env: Env,
): Promise<CheckRequest> {
  const base = {
    monitorId: mon.id,
    location,
    timeout: mon.timeout,
    contentCheck: mon.contentCheck ? JSON.parse(mon.contentCheck) : undefined,
  };

  if (mon.type === "http") {
    let decryptedPassword: string | undefined;
    if (mon.password) {
      try {
        decryptedPassword = await decrypt(mon.password, env.ENCRYPTION_SECRET);
      } catch {
        console.error(`Failed to decrypt password for monitor ${mon.id}`);
      }
    }

    return {
      ...base,
      type: "http",
      url: mon.url!,
      method: mon.method ?? "get",
      headers: mon.headers ? JSON.parse(mon.headers) : undefined,
      body: mon.body ?? undefined,
      username: mon.username ?? undefined,
      password: decryptedPassword,
      expectedStatusCodes: mon.expectedStatusCodes
        ? JSON.parse(mon.expectedStatusCodes)
        : [200],
      followRedirects: mon.followRedirects,
    };
  }

  if (mon.type === "dns") {
    return {
      ...base,
      type: "dns",
      host: mon.host!,
      assertions: parseDnsAssertions(mon),
      resolver: mon.dnsResolver,
    };
  }

  return {
    ...base,
    type: "tcp",
    host: mon.host!,
    port: mon.port!,
  };
}

async function dispatchToLocation(
  request: CheckRequest,
  location: Location,
  env: Env,
): Promise<CheckResult> {
  const doId = env.CHECKER.idFromName(`checker-${location}`);
  const stub = env.CHECKER.get(doId, {
    locationHint: LOCATION_HINTS[location],
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= DISPATCH_MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = DISPATCH_INITIAL_DELAY * Math.pow(2, attempt - 1);
      await sleep(delay);
    }

    try {
      const response = await stub.fetch("https://checker.internal/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Checker dispatch failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
    }
  }

  throw lastError!;
}

async function dispatchChecks(
  monitors: MonitorRow[],
  env: Env,
): Promise<CheckResult[]> {
  const tasks: Array<() => Promise<CheckResult>> = [];

  for (const mon of monitors) {
    const locations: Location[] = JSON.parse(mon.locations);

    for (const location of locations) {
      tasks.push(async () => {
        try {
          const jitterMs = computeDispatchJitter(mon.id, location);
          if (jitterMs > 0) {
            await sleep(jitterMs);
          }

          const request = await buildCheckRequest(mon, location, env);
          return await dispatchToLocation(request, location, env);
        } catch (error) {
          return {
            monitorId: mon.id,
            location,
            result: "error" as const,
            responseTime: 0,
            errorMessage:
              error instanceof Error ? error.message : "Dispatch failed",
            cause: "network_error",
            retryCount: 0,
            checkedAt: Date.now(),
          };
        }
      });
    }
  }

  return runWithConcurrency(tasks, MAX_DISPATCH_CONCURRENCY);
}

function resolveStatus(results: CheckResult[]): MonitorStatus {
  if (results.length === 0) return "initializing";

  const successCount = results.filter(
    (r) => r.result === "success" || r.result === "degraded",
  ).length;
  const degradedCount = results.filter((r) => r.result === "degraded").length;
  const failureCount = results.filter(
    (r) =>
      r.result === "failure" || r.result === "timeout" || r.result === "error",
  ).length;

  if (successCount === results.length && degradedCount === 0) return "up";
  if (failureCount === results.length) return "down";
  return "degraded";
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

async function processResults(results: CheckResult[], env: Env): Promise<void> {
  if (results.length === 0) return;

  const db = createDb(env.DB);

  const byMonitor = groupByMonitor(results);

  for (const [monitorId, monitorResults] of byMonitor) {
    const [currentMonitor] = await db
      .select({
        status: monitor.status,
        name: monitor.name,
        teamId: monitor.teamId,
        responseTimeThreshold: monitor.responseTimeThreshold,
        url: monitor.url,
      })
      .from(monitor)
      .where(eq(monitor.id, monitorId))
      .limit(1);

    if (!currentMonitor) continue;

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
      { name: currentMonitor.name, url: currentMonitor.url ?? undefined },
      env,
    );

    await dispatchIntegrations({
      monitorId,
      monitorName: currentMonitor.name,
      teamId: currentMonitor.teamId,
      oldStatus,
      newStatus,
      results: processedResults,
      incidentEvents,
      env,
    });
  }
}

export async function runPipeline(
  monitors: MonitorRow[],
  env: Env,
): Promise<void> {
  const results = await dispatchChecks(monitors, env);
  await processResults(results, env);
}
