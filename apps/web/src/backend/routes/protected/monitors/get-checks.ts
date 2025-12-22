import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { and, desc, eq, gte } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { checkResult, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const CheckResultSchema = z.object({
  id: z.number(),
  location: z.string(),
  result: z.string(),
  responseTime: z.number(),
  statusCode: z.number().nullable(),
  errorMessage: z.string().nullable(),
  checkedAt: z.number(),
});

const route = createRoute({
  method: "get",
  path: "/:teamId/:monitorId/checks",
  tags: ["monitors"],
  summary: "Get check history",
  request: {
    query: z.object({
      days: z.string().optional().default("14"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(CheckResultSchema),
        },
      },
      description: "Check results",
    },
  },
});

export function registerGetChecks(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { monitorId } = c.req.param();
    const { days } = c.req.valid("query");

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
          eq(monitor.id, Number(monitorId)),
        ),
      )
      .limit(1);

    if (!mon) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const checks = await db
      .select({
        id: checkResult.id,
        location: checkResult.location,
        result: checkResult.result,
        responseTime: checkResult.responseTime,
        statusCode: checkResult.statusCode,
        errorMessage: checkResult.errorMessage,
        checkedAt: checkResult.checkedAt,
      })
      .from(checkResult)
      .where(
        and(
          eq(checkResult.monitorId, Number(monitorId)),
          gte(checkResult.checkedAt, since),
        ),
      )
      .orderBy(desc(checkResult.checkedAt));

    return c.json(
      checks.map((c) => ({
        ...c,
        checkedAt: c.checkedAt.getTime(),
      })),
      200,
    );
  });
}
