import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor } from "../../../db/schema";
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
          schema: MonitorResponseSchema.omit({ domainCheck: true }),
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

    const baseData = {
      teamId: teamContext.teamId,
      type: data.type,
      name: data.name,
      interval: data.interval,
      timeout: data.timeout,
      locations: JSON.stringify(data.locations),
      status: "initializing" as const,
      contentCheck: data.contentCheck
        ? JSON.stringify(data.contentCheck)
        : null,
    };

    const insertData =
      data.type === "http"
        ? {
            ...baseData,
            url: data.url,
            method: data.method,
            headers: data.headers ? JSON.stringify(data.headers) : null,
            body: data.body ?? null,
            username: data.username ?? null,
            password: data.password ?? null,
            expectedStatusCodes: JSON.stringify(
              data.expectedStatusCodes ?? [200]
            ),
            followRedirects: data.followRedirects ?? true,
            verifySSL: data.verifySSL ?? true,
            checkDNS: data.checkDNS ?? true,
            checkDomain: data.checkDomain ?? true,
          }
        : {
            ...baseData,
            host: data.host,
            port: data.port,
            followRedirects: false,
            verifySSL: false,
            checkDNS: false,
            checkDomain: false,
          };

    const [createdMonitor] = await db
      .insert(monitor)
      .values(insertData)
      .returning();

    return c.json(createdMonitor, 201);
  });
}
