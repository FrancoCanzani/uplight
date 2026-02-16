import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import {
  analystFinding,
  checkResult,
  domainCheckResult,
  monitor,
} from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { MonitorResponseSchema } from "./schemas";

const AT_RISK_LOOKBACK_MS = 12 * 60 * 60 * 1000;
const RECENT_CHECKS_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const MAX_CHECKS_PER_MONITOR = 100;

function isPredictionAtRisk(rawPrediction: string | null): boolean {
  if (!rawPrediction) return true;

  try {
    const parsed = JSON.parse(rawPrediction) as {
      failure_probability?: unknown;
    };
    if (typeof parsed.failure_probability === "number") {
      return parsed.failure_probability >= 0.6;
    }
    return true;
  } catch {
    return true;
  }
}

const route = createRoute({
  method: "get",
  path: "/:teamId",
  tags: ["monitors"],
  summary: "Get all monitors",
  description: "Gets all monitors for a team",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(MonitorResponseSchema),
        },
      },
      description: "List of monitors",
    },
  },
});

export function registerGetAllMonitors(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const monitors = await db
      .select()
      .from(monitor)
      .where(eq(monitor.teamId, teamContext.teamId));

    const monitorIds = monitors.map((m) => m.id);
    const domainCheckMap = new Map<
      number,
      typeof domainCheckResult.$inferSelect
    >();
    const lastCheckMap = new Map<
      number,
      { checkedAt: number; responseTime: number }
    >();
    const recentChecksMap = new Map<
      number,
      (typeof checkResult.$inferSelect)[]
    >();
    const atRiskMap = new Map<number, boolean>();

    if (monitorIds.length > 0) {
      const recentChecksCutoff = new Date(
        Date.now() - RECENT_CHECKS_LOOKBACK_MS,
      );

      // Run all queries in parallel — they're independent
      const [allDomainChecks, recentChecks, recentPredictions] =
        await Promise.all([
          db
            .select()
            .from(domainCheckResult)
            .where(inArray(domainCheckResult.monitorId, monitorIds))
            .orderBy(desc(domainCheckResult.checkedAt)),
          db
            .select()
            .from(checkResult)
            .where(
              and(
                inArray(checkResult.monitorId, monitorIds),
                gte(checkResult.checkedAt, recentChecksCutoff),
              ),
            )
            .orderBy(desc(checkResult.checkedAt)),
          db
            .select({
              monitorId: analystFinding.monitorId,
              prediction: analystFinding.prediction,
            })
            .from(analystFinding)
            .where(
              and(
                inArray(analystFinding.monitorId, monitorIds),
                eq(analystFinding.severity, "predicted"),
                gte(
                  analystFinding.createdAt,
                  new Date(Date.now() - AT_RISK_LOOKBACK_MS),
                ),
              ),
            )
            .orderBy(desc(analystFinding.createdAt)),
        ]);

      // Build domain check map (keep only latest per monitor)
      for (const check of allDomainChecks) {
        if (!domainCheckMap.has(check.monitorId)) {
          domainCheckMap.set(check.monitorId, check);
        }
      }

      // Build last check + recent checks maps from a single query
      for (const check of recentChecks) {
        if (!lastCheckMap.has(check.monitorId)) {
          lastCheckMap.set(check.monitorId, {
            checkedAt: check.checkedAt.getTime(),
            responseTime: check.responseTime,
          });
        }
        if (!recentChecksMap.has(check.monitorId)) {
          recentChecksMap.set(check.monitorId, []);
        }
        const checks = recentChecksMap.get(check.monitorId)!;
        if (checks.length < MAX_CHECKS_PER_MONITOR) {
          checks.push(check);
        }
      }

      // Build at-risk map
      for (const finding of recentPredictions) {
        if (!atRiskMap.has(finding.monitorId)) {
          atRiskMap.set(
            finding.monitorId,
            isPredictionAtRisk(finding.prediction),
          );
        }
      }
    }

    const result = monitors.map((mon) => {
      const domainCheck = domainCheckMap.get(mon.id);
      const lastCheck = lastCheckMap.get(mon.id);
      const recentChecks = recentChecksMap.get(mon.id) || [];

      return {
        ...mon,
        atRisk: atRiskMap.get(mon.id) ?? false,
        password: mon.password ? "********" : null,
        createdAt: mon.createdAt.toISOString(),
        updatedAt: mon.updatedAt.toISOString(),
        domainCheck: domainCheck
          ? {
              id: domainCheck.id,
              domain: domainCheck.domain,
              whoisCreatedDate: domainCheck.whoisCreatedDate,
              whoisUpdatedDate: domainCheck.whoisUpdatedDate,
              whoisExpirationDate: domainCheck.whoisExpirationDate,
              whoisRegistrar: domainCheck.whoisRegistrar,
              whoisError: domainCheck.whoisError,
              sslIssuer: domainCheck.sslIssuer,
              sslExpiry: domainCheck.sslExpiry?.getTime() ?? null,
              sslIsSelfSigned: domainCheck.sslIsSelfSigned,
              sslError: domainCheck.sslError,
              checkedAt: domainCheck.checkedAt.getTime(),
            }
          : null,
        lastCheckAt: lastCheck?.checkedAt ?? null,
        lastResponseTime: lastCheck?.responseTime ?? null,
        recentChecks: recentChecks
          .slice(0, MAX_CHECKS_PER_MONITOR)
          .reverse()
          .map((check) => ({
            id: check.id,
            location: check.location,
            result: check.result,
            responseTime: check.responseTime,
            statusCode: check.statusCode,
            errorMessage: check.errorMessage,
            checkedAt: check.checkedAt.getTime(),
          })),
      };
    });

    return c.json(result, 200);
  });
}
