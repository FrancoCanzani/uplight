import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { and, eq, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor, incident } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const IncidentSchema = z.object({
  id: z.number(),
  cause: z.string(),
  status: z.string(),
  startedAt: z.number(),
  resolvedAt: z.number().nullable(),
  createdAt: z.number(),
});

const route = createRoute({
  method: "get",
  path: "/:teamId/:monitorId/incidents",
  tags: ["monitors"],
  summary: "Get last incident",
  request: {
    query: z.object({
      limit: z.string().optional().default("1"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IncidentSchema.nullable(),
        },
      },
      description: "Last incident",
    },
  },
});

export function registerGetIncidents(api: OpenAPIHono<AppEnv>) {
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

    const [lastIncident] = await db
      .select()
      .from(incident)
      .where(eq(incident.monitorId, Number(monitorId)))
      .orderBy(desc(incident.startedAt))
      .limit(1);

    if (!lastIncident) {
      return c.json(null, 200);
    }

    return c.json(
      {
        id: lastIncident.id,
        cause: lastIncident.cause,
        status: lastIncident.status,
        startedAt: lastIncident.startedAt.getTime(),
        resolvedAt: lastIncident.resolvedAt?.getTime() ?? null,
        createdAt: lastIncident.createdAt.getTime(),
      },
      200
    );
  });
}
