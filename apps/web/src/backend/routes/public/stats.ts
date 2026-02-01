import { OpenAPIHono } from "@hono/zod-openapi";
import { avg, count, gte, sql, sum } from "drizzle-orm";
import { createDb } from "../../db";
import { checkResult } from "../../db/schema";
import type { AppEnv } from "../../types";

export function registerGetStats(api: OpenAPIHono<AppEnv>) {
  return api.get("/stats", async (c) => {
    const db = createDb(c.env.DB);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const row = await db
      .select({
        total: count(),
        successes: sum(
          sql<number>`CASE WHEN ${checkResult.result} = 'success' THEN 1 ELSE 0 END`,
        ),
        avgResponseTime: avg(checkResult.responseTime),
        regions: sql<number>`COUNT(DISTINCT ${checkResult.location})`,
      })
      .from(checkResult)
      .where(gte(checkResult.checkedAt, oneDayAgo))
      .get();

    const total = row?.total ?? 0;
    const successes = Number(row?.successes ?? 0);
    const uptime =
      total > 0 ? ((successes / total) * 100).toFixed(2) : "100.00";

    c.header("Cache-Control", "public, max-age=300");

    return c.json({
      checks: total,
      uptime,
      avgResponseTime: row?.avgResponseTime
        ? Math.round(Number(row.avgResponseTime))
        : 0,
      regions: row?.regions ?? 0,
    });
  });
}
