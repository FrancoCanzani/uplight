import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { and, eq, gte, lte, desc, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor, incident } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const IncidentWithMonitorSchema = z.object({
  id: z.number(),
  monitorId: z.number(),
  monitorName: z.string(),
  cause: z.string(),
  status: z.string(),
  startedAt: z.number(),
  resolvedAt: z.number().nullable(),
  createdAt: z.number(),
});

const ResponseSchema = z.object({
  incidents: z.array(IncidentWithMonitorSchema),
  hasMore: z.boolean(),
  total: z.number(),
});

const route = createRoute({
  method: "get",
  path: "/:teamId",
  tags: ["incidents"],
  summary: "List all incidents for a team",
  request: {
    query: z.object({
      limit: z.string().optional().default("20"),
      offset: z.string().optional().default("0"),
      monitorId: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "Paginated list of incidents",
    },
  },
});

export function registerGetAllIncidents(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { limit, offset, monitorId, from, to } = c.req.valid("query");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const teamMonitors = await db
      .select({ id: monitor.id, name: monitor.name })
      .from(monitor)
      .where(eq(monitor.teamId, teamContext.teamId));

    if (teamMonitors.length === 0) {
      return c.json({ incidents: [], hasMore: false, total: 0 }, 200);
    }

    const monitorIds = teamMonitors.map((m) => m.id);
    const monitorMap = new Map(teamMonitors.map((m) => [m.id, m.name]));

    const conditions = [inArray(incident.monitorId, monitorIds)];

    if (monitorId) {
      const mid = Number(monitorId);
      if (!monitorIds.includes(mid)) {
        throw new HTTPException(404, { message: "Monitor not found" });
      }
      conditions.push(eq(incident.monitorId, mid));
    }

    if (from) {
      conditions.push(gte(incident.startedAt, new Date(Number(from))));
    }

    if (to) {
      conditions.push(lte(incident.startedAt, new Date(Number(to))));
    }

    const allIncidents = await db
      .select()
      .from(incident)
      .where(and(...conditions))
      .orderBy(desc(incident.startedAt));

    const total = allIncidents.length;
    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    const paginatedIncidents = allIncidents.slice(
      offsetNum,
      offsetNum + limitNum
    );

    const hasMore = offsetNum + limitNum < total;

    return c.json(
      {
        incidents: paginatedIncidents.map((i) => ({
          id: i.id,
          monitorId: i.monitorId,
          monitorName: monitorMap.get(i.monitorId) ?? "Unknown",
          cause: i.cause,
          status: i.status,
          startedAt: i.startedAt.getTime(),
          resolvedAt: i.resolvedAt?.getTime() ?? null,
          createdAt: i.createdAt.getTime(),
        })),
        hasMore,
        total,
      },
      200
    );
  });
}
