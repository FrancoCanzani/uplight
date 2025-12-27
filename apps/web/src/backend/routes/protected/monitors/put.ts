import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { and, eq, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor, domainCheckResult } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import {
  HttpMonitorSchema,
  MonitorResponseSchema,
  TcpMonitorSchema,
} from "./schemas";

const UpdateHttpMonitorSchema = HttpMonitorSchema.partial().extend({
  type: z.literal("http"),
});

const UpdateTcpMonitorSchema = TcpMonitorSchema.partial().extend({
  type: z.literal("tcp"),
});

const UpdateMonitorSchema = z
  .discriminatedUnion("type", [UpdateHttpMonitorSchema, UpdateTcpMonitorSchema])
  .openapi("UpdateMonitor");

const route = createRoute({
  method: "put",
  path: "/:teamId/:monitorId",
  tags: ["monitors"],
  summary: "Update a monitor",
  description: "Updates an HTTP or TCP monitor",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateMonitorSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MonitorResponseSchema,
        },
      },
      description: "Monitor updated successfully",
    },
    404: {
      description: "Monitor not found",
    },
  },
});

export function registerPutMonitor(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { monitorId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const existingMonitor = await db
      .select()
      .from(monitor)
      .where(
        and(
          eq(monitor.teamId, teamContext.teamId),
          eq(monitor.id, Number(monitorId))
        )
      )
      .limit(1);

    if (!existingMonitor[0]) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    const baseUpdates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) baseUpdates.name = data.name;
    if (data.interval !== undefined) baseUpdates.interval = data.interval;
    if (data.timeout !== undefined) baseUpdates.timeout = data.timeout;
    if (data.responseTimeThreshold !== undefined)
      baseUpdates.responseTimeThreshold = data.responseTimeThreshold ?? null;
    if (data.locations !== undefined)
      baseUpdates.locations = JSON.stringify(data.locations);
    if (
      data.type === "http" &&
      "contentCheck" in data &&
      data.contentCheck !== undefined
    )
      baseUpdates.contentCheck = data.contentCheck
        ? JSON.stringify(data.contentCheck)
        : null;

    if (data.type === "http") {
      if (data.url !== undefined) baseUpdates.url = data.url;
      if (data.method !== undefined) baseUpdates.method = data.method;
      if (data.headers !== undefined)
        baseUpdates.headers = data.headers
          ? JSON.stringify(data.headers)
          : null;
      if (data.body !== undefined) baseUpdates.body = data.body ?? null;
      if (data.username !== undefined)
        baseUpdates.username = data.username ?? null;
      if (data.password !== undefined)
        baseUpdates.password = data.password ?? null;
      if (data.expectedStatusCodes !== undefined)
        baseUpdates.expectedStatusCodes = JSON.stringify(
          data.expectedStatusCodes
        );
      if (data.followRedirects !== undefined)
        baseUpdates.followRedirects = data.followRedirects;
      if (data.verifySSL !== undefined) baseUpdates.verifySSL = data.verifySSL;
      if (data.checkDNS !== undefined) baseUpdates.checkDNS = data.checkDNS;
      if (data.checkDomain !== undefined)
        baseUpdates.checkDomain = data.checkDomain;
    } else if (data.type === "tcp") {
      if (data.host !== undefined) baseUpdates.host = data.host;
      if (data.port !== undefined) baseUpdates.port = data.port;
    }

    const [updatedMonitor] = await db
      .update(monitor)
      .set(baseUpdates)
      .where(
        and(
          eq(monitor.teamId, teamContext.teamId),
          eq(monitor.id, Number(monitorId))
        )
      )
      .returning();

    const [lastDomainCheck] = await db
      .select()
      .from(domainCheckResult)
      .where(eq(domainCheckResult.monitorId, updatedMonitor.id))
      .orderBy(desc(domainCheckResult.checkedAt))
      .limit(1);

    return c.json(
      {
        ...updatedMonitor,
        createdAt: updatedMonitor.createdAt.toISOString(),
        updatedAt: updatedMonitor.updatedAt.toISOString(),
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
      },
      200
    );
  });
}
