import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, desc, eq, gte, lte } from "drizzle-orm";
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

const ChecksResponseSchema = z.object({
  checks: z.array(CheckResultSchema),
  hasMore: z.boolean(),
  total: z.number(),
});

const route = createRoute({
  method: "get",
  path: "/:teamId/:monitorId/checks",
  tags: ["monitors"],
  summary: "Get check history with pagination and filtering",
  request: {
    query: z.object({
      limit: z.string().optional().default("50"),
      offset: z.string().optional().default("0"),
      days: z.string().optional().default("14"),
      result: z.string().optional(),
      location: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ChecksResponseSchema,
        },
      },
      description: "Paginated check results",
    },
  },
});

export function registerGetChecks(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { monitorId } = c.req.param();
    const { limit, offset, days, result, location, dateFrom, dateTo } =
      c.req.valid("query");

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

    const conditions = [eq(checkResult.monitorId, Number(monitorId))];

    // Date filtering - use days if no dateFrom/dateTo provided
    if (dateFrom) {
      const dateFromNum = Number(dateFrom);
      if (!isNaN(dateFromNum)) {
        conditions.push(gte(checkResult.checkedAt, new Date(dateFromNum)));
      }
    } else if (dateTo) {
      // If only dateTo is provided, still need a start date
      const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
      conditions.push(gte(checkResult.checkedAt, since));
    } else {
      // Default to days filter
      const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
      conditions.push(gte(checkResult.checkedAt, since));
    }

    if (dateTo) {
      const dateToNum = Number(dateTo);
      if (!isNaN(dateToNum)) {
        conditions.push(lte(checkResult.checkedAt, new Date(dateToNum)));
      }
    }

    if (result) {
      const validResults = [
        "success",
        "failure",
        "timeout",
        "error",
        "maintenance",
        "degraded",
      ] as const;
      type ResultType = (typeof validResults)[number];
      if (validResults.includes(result as ResultType)) {
        conditions.push(eq(checkResult.result, result as ResultType));
      }
    }

    if (location) {
      conditions.push(eq(checkResult.location, location));
    }

    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    const query = db
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
      .where(and(...conditions))
      .orderBy(desc(checkResult.checkedAt))
      .offset(offsetNum);

    const checks =
      limitNum === 0
        ? await query
        : await query.limit(limitNum + 1);

    const hasMore = limitNum === 0 ? false : checks.length > limitNum;
    const paginatedChecks = limitNum === 0 ? checks : checks.slice(0, limitNum);

    const totalResult = await db
      .select({ id: checkResult.id })
      .from(checkResult)
      .where(and(...conditions));

    return c.json(
      {
        checks: paginatedChecks.map((c) => ({
          ...c,
          checkedAt: c.checkedAt.getTime(),
        })),
        hasMore,
        total: totalResult.length,
      },
      200,
    );
  });
}
