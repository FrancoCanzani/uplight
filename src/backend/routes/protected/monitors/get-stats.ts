import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { and, eq, gte, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor, checkResult } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const StatsResponseSchema = z
  .object({
    uptimePercentage: z.number(),
    avgResponseTime: z.number(),
    totalChecks: z.number(),
    successfulChecks: z.number(),
    lastCheckAt: z.number().nullable(),
    locationStats: z.array(
      z.object({
        location: z.string(),
        status: z.string(),
        responseTime: z.number(),
        lastCheckAt: z.number(),
      })
    ),
  })
  .openapi("MonitorStats");

const route = createRoute({
  method: "get",
  path: "/:teamId/:monitorId/stats",
  tags: ["monitors"],
  summary: "Get monitor stats",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: StatsResponseSchema,
        },
      },
      description: "Monitor statistics",
    },
  },
});

export function registerGetStats(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { monitorId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const [mon] = await db
      .select()
      .from(monitor)
      .where(
        and(
          eq(monitor.teamId, teamContext.teamId),
          eq(monitor.id, Number(monitorId))
        )
      )
      .limit(1);

    if (!mon) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const checks = await db
      .select()
      .from(checkResult)
      .where(
        and(
          eq(checkResult.monitorId, Number(monitorId)),
          gte(checkResult.checkedAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(checkResult.checkedAt));

    const totalChecks = checks.length;
    const successfulChecks = checks.filter(
      (c) => c.status === "success" || c.status === "maintenance"
    ).length;
    const uptimePercentage =
      totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;

    const responseChecks = checks.filter(
      (c) => c.status === "success" && c.responseTime > 0
    );
    const avgResponseTime =
      responseChecks.length > 0
        ? responseChecks.reduce((sum, c) => sum + c.responseTime, 0) /
          responseChecks.length
        : 0;

    const lastCheckAt = checks[0]?.checkedAt.getTime() ?? null;

    const locationMap = new Map<
      string,
      { status: string; responseTime: number; lastCheckAt: number }
    >();

    for (const check of checks) {
      if (!locationMap.has(check.location)) {
        locationMap.set(check.location, {
          status: check.status,
          responseTime: check.responseTime,
          lastCheckAt: check.checkedAt.getTime(),
        });
      }
    }

    const locationStats = Array.from(locationMap.entries()).map(
      ([location, stats]) => ({
        location,
        ...stats,
      })
    );

    return c.json(
      {
        uptimePercentage: Math.round(uptimePercentage * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        totalChecks,
        successfulChecks,
        lastCheckAt,
        locationStats,
      },
      200
    );
  });
}

