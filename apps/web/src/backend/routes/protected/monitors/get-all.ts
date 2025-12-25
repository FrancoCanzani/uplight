import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq, desc, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor, domainCheckResult } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { MonitorResponseSchema } from "./schemas";

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

    if (monitorIds.length > 0) {
      const allDomainChecks = await db
        .select()
        .from(domainCheckResult)
        .where(inArray(domainCheckResult.monitorId, monitorIds))
        .orderBy(desc(domainCheckResult.checkedAt));

      for (const check of allDomainChecks) {
        if (!domainCheckMap.has(check.monitorId)) {
          domainCheckMap.set(check.monitorId, check);
        }
      }
    }

    const result = monitors.map((mon) => {
      const domainCheck = domainCheckMap.get(mon.id);
      return {
        ...mon,
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
      };
    });

    return c.json(result, 200);
  });
}
