import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, desc, eq, gte } from "drizzle-orm";
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
  path: "/:teamId/:monitorId",
  tags: ["monitors"],
  summary: "Get monitor",
  description: "Get a monitor for a team",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MonitorResponseSchema,
        },
      },
      description: "Selected monitor",
    },
  },
});

export function registerGetMonitor(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { monitorId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const result = await db
      .select()
      .from(monitor)
      .where(
        and(
          eq(monitor.teamId, teamContext.teamId),
          eq(monitor.id, Number(monitorId)),
        ),
      )
      .limit(1);

    if (!result[0]) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    const [lastDomainCheck] = await db
      .select()
      .from(domainCheckResult)
      .where(eq(domainCheckResult.monitorId, result[0].id))
      .orderBy(desc(domainCheckResult.checkedAt))
      .limit(1);

    const [lastCheck] = await db
      .select({
        checkedAt: checkResult.checkedAt,
        responseTime: checkResult.responseTime,
      })
      .from(checkResult)
      .where(eq(checkResult.monitorId, result[0].id))
      .orderBy(desc(checkResult.checkedAt))
      .limit(1);

    const recentChecks = await db
      .select()
      .from(checkResult)
      .where(eq(checkResult.monitorId, result[0].id))
      .orderBy(desc(checkResult.checkedAt))
      .limit(100);

    const [recentPrediction] = await db
      .select({
        prediction: analystFinding.prediction,
      })
      .from(analystFinding)
      .where(
        and(
          eq(analystFinding.monitorId, result[0].id),
          eq(analystFinding.severity, "predicted"),
          gte(
            analystFinding.createdAt,
            new Date(Date.now() - AT_RISK_LOOKBACK_MS),
          ),
        ),
      )
      .orderBy(desc(analystFinding.createdAt))
      .limit(1);

    return c.json(
      {
        ...result[0],
        atRisk: recentPrediction
          ? isPredictionAtRisk(recentPrediction.prediction)
          : false,
        password: result[0].password ? "********" : null,
        createdAt: result[0].createdAt.toISOString(),
        updatedAt: result[0].updatedAt.toISOString(),
        domainCheck: lastDomainCheck
          ? {
              id: lastDomainCheck.id,
              domain: lastDomainCheck.domain,
              whoisCreatedDate: lastDomainCheck.whoisCreatedDate,
              whoisUpdatedDate: lastDomainCheck.whoisUpdatedDate,
              whoisExpirationDate: lastDomainCheck.whoisExpirationDate,
              whoisRegistrar: lastDomainCheck.whoisRegistrar,
              whoisError: lastDomainCheck.whoisError,
              sslIssuer: lastDomainCheck.sslIssuer,
              sslExpiry: lastDomainCheck.sslExpiry?.getTime() ?? null,
              sslIsSelfSigned: lastDomainCheck.sslIsSelfSigned,
              sslError: lastDomainCheck.sslError,
              checkedAt: lastDomainCheck.checkedAt.getTime(),
            }
          : null,
        lastCheckAt: lastCheck?.checkedAt.getTime() ?? null,
        lastResponseTime: lastCheck?.responseTime ?? null,
        recentChecks: recentChecks
          .slice()
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
      },
      200,
    );
  });
}
