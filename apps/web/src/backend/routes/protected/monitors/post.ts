import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { checkResult, domainCheckResult, monitor } from "../../../db/schema";
import { encrypt } from "../../../lib/crypto";
import type { AppEnv } from "../../../types";
import { CreateMonitorSchema, MonitorResponseSchema } from "./schemas";

const route = createRoute({
  method: "post",
  path: "/:teamId",
  tags: ["monitors"],
  summary: "Create a new monitor",
  description: "Creates an HTTP or TCP monitor for uptime monitoring",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateMonitorSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: MonitorResponseSchema,
        },
      },
      description: "Monitor created successfully",
    },
  },
});

export function registerPostMonitor(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    let encryptedPassword: string | null = null;
    if (data.type === "http" && data.password) {
      encryptedPassword = await encrypt(
        data.password,
        c.env.ENCRYPTION_SECRET,
      );
    }

    const insertData =
      data.type === "http"
        ? {
            teamId: teamContext.teamId,
            type: data.type,
            name: data.name,
            interval: data.interval,
            timeout: data.timeout,
            responseTimeThreshold: data.responseTimeThreshold ?? null,
            locations: JSON.stringify(data.locations),
            status: "initializing" as const,
            url: data.url,
            method: data.method,
            headers: data.headers ? JSON.stringify(data.headers) : null,
            body: data.body ?? null,
            username: data.username ?? null,
            password: encryptedPassword,
            expectedStatusCodes: JSON.stringify(
              data.expectedStatusCodes ?? [200],
            ),
            followRedirects: data.followRedirects ?? true,
            checkDomain: data.checkDomain ?? true,
            contentCheck: data.contentCheck
              ? JSON.stringify(data.contentCheck)
              : null,
          }
        : {
            teamId: teamContext.teamId,
            type: data.type,
            name: data.name,
            interval: data.interval,
            timeout: data.timeout,
            responseTimeThreshold: data.responseTimeThreshold ?? null,
            locations: JSON.stringify(data.locations),
            status: "initializing" as const,
            host: data.host,
            port: data.port,
            followRedirects: false,
            checkDomain: false,
            contentCheck: null,
          };

    const [createdMonitor] = await db
      .insert(monitor)
      .values(insertData)
      .returning();

    const [lastDomainCheck] = await db
      .select()
      .from(domainCheckResult)
      .where(eq(domainCheckResult.monitorId, createdMonitor.id))
      .orderBy(desc(domainCheckResult.checkedAt))
      .limit(1);

    const [lastCheck] = await db
      .select({
        checkedAt: checkResult.checkedAt,
        responseTime: checkResult.responseTime,
      })
      .from(checkResult)
      .where(eq(checkResult.monitorId, createdMonitor.id))
      .orderBy(desc(checkResult.checkedAt))
      .limit(1);

    return c.json(
      {
        ...createdMonitor,
        password: createdMonitor.password ? "********" : null,
        createdAt: createdMonitor.createdAt.toISOString(),
        updatedAt: createdMonitor.updatedAt.toISOString(),
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
        recentChecks: [],
      },
      201,
    );
  });
}
