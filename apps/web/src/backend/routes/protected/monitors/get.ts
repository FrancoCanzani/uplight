import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor, domainCheckResult } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { MonitorResponseSchema } from "./schemas";

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
          eq(monitor.id, Number(monitorId))
        )
      )
      .limit(1);

    if (!result[0]) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    const [lastDomainCheck] = await db
      .select()
      .from(domainCheckResult)
      .where(eq(domainCheckResult.monitorId, Number(monitorId)))
      .orderBy(desc(domainCheckResult.checkedAt))
      .limit(1);

    const monitorWithDomainCheck = {
      ...result[0],
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
    };

    return c.json(monitorWithDomainCheck, 200);
  });
}
