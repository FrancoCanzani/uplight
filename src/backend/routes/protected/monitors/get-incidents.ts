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
  summary: "Get incidents",
  request: {
    query: z.object({
      limit: z.string().optional().default("10"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(IncidentSchema),
        },
      },
      description: "Incidents",
    },
  },
});

export function registerGetIncidents(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { monitorId } = c.req.param();
    const { limit } = c.req.valid("query");

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

    const incidents = await db
      .select()
      .from(incident)
      .where(eq(incident.monitorId, Number(monitorId)))
      .orderBy(desc(incident.startedAt))
      .limit(Number(limit));

    return c.json(
      incidents.map((i) => ({
        id: i.id,
        cause: i.cause,
        status: i.status,
        startedAt: i.startedAt.getTime(),
        resolvedAt: i.resolvedAt?.getTime() ?? null,
        createdAt: i.createdAt.getTime(),
      })),
      200
    );
  });
}

