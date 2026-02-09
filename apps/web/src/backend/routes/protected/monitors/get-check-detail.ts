import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import {
  checkResult,
  monitor,
} from "../../../db/schema";
import type { AppEnv } from "../../../types";

const CheckDetailSchema = z.object({
  id: z.number(),
  monitorId: z.number(),
  location: z.string(),
  result: z.string(),
  responseTime: z.number(),
  statusCode: z.number().nullable(),
  errorMessage: z.string().nullable(),
  responseHeaders: z.record(z.string(), z.string()).nullable(),
  responseBody: z.string().nullable(),
  retryCount: z.number(),
  checkedAt: z.number(),
});

const route = createRoute({
  method: "get",
  path: "/:teamId/:monitorId/checks/:checkId",
  tags: ["monitors"],
  summary: "Get a single check with full details",
  request: {
    params: z.object({
      teamId: z.string(),
      monitorId: z.string(),
      checkId: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CheckDetailSchema,
        },
      },
      description: "Check details with headers and body",
    },
  },
});

export function registerGetCheckDetail(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const { monitorId, checkId } = c.req.param();

    const db = createDb(c.env.DB);
    const checkIdNum = Number(checkId);
    const monitorIdNum = Number(monitorId);

    if (isNaN(checkIdNum) || isNaN(monitorIdNum)) {
      throw new HTTPException(400, { message: "Invalid check or monitor ID" });
    }

    // Verify monitor belongs to team
    const [mon] = await db
      .select()
      .from(monitor)
      .where(
        and(
          eq(monitor.id, monitorIdNum),
          eq(monitor.teamId, teamContext.teamId),
        ),
      )
      .limit(1);

    if (!mon) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    const check = await db
      .select({
        id: checkResult.id,
        monitorId: checkResult.monitorId,
        location: checkResult.location,
        result: checkResult.result,
        responseTime: checkResult.responseTime,
        statusCode: checkResult.statusCode,
        errorMessage: checkResult.errorMessage,
        responseHeaders: checkResult.responseHeaders,
        responseBody: checkResult.responseBody,
        retryCount: checkResult.retryCount,
        checkedAt: checkResult.checkedAt,
      })
      .from(checkResult)
      .where(
        and(
          eq(checkResult.id, checkIdNum),
          eq(checkResult.monitorId, monitorIdNum),
        ),
      )
      .limit(1);

    if (check.length === 0) {
      throw new HTTPException(404, { message: "Check not found" });
    }

    const checkData = check[0];

    let parsedHeaders: Record<string, string> | null = null;
    if (checkData.responseHeaders) {
      try {
        parsedHeaders = JSON.parse(checkData.responseHeaders);
      } catch {
        parsedHeaders = null;
      }
    }

    return c.json(
      {
        id: checkData.id,
        monitorId: checkData.monitorId,
        location: checkData.location,
        result: checkData.result,
        responseTime: checkData.responseTime,
        statusCode: checkData.statusCode,
        errorMessage: checkData.errorMessage,
        responseHeaders: parsedHeaders,
        responseBody: checkData.responseBody,
        retryCount: checkData.retryCount,
        checkedAt: checkData.checkedAt.getTime(),
      },
      200,
    );
  });
}
