import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { and, eq, gte, lte, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import {
  monitor,
  incident,
  heartbeat,
  heartbeatIncident,
} from "../../../db/schema";
import type { AppEnv } from "../../../types";

const IncidentWithMonitorSchema = z.object({
  id: z.number(),
  monitorId: z.number(),
  monitorName: z.string(),
  cause: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  hint: z.string().nullable(),
  severity: z.enum(["low", "medium", "high", "critical"]).nullable(),
  status: z.enum(["active", "acknowledged", "fixing", "resolved", "ongoing"]),
  startedAt: z.number(),
  acknowledgedAt: z.number().nullable(),
  fixingAt: z.number().nullable(),
  resolvedAt: z.number().nullable(),
  type: z.enum(["monitor", "heartbeat"]),
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
      heartbeatId: z.string().optional(),
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
    const { limit, offset, monitorId, heartbeatId, from, to } =
      c.req.valid("query");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    // Fetch team monitors
    const teamMonitors = await db
      .select({ id: monitor.id, name: monitor.name })
      .from(monitor)
      .where(eq(monitor.teamId, teamContext.teamId));

    // Fetch team heartbeats
    const teamHeartbeats = await db
      .select({ id: heartbeat.id, name: heartbeat.name })
      .from(heartbeat)
      .where(eq(heartbeat.teamId, teamContext.teamId));

    const monitorIds = teamMonitors.map((m) => m.id);
    const heartbeatIds = teamHeartbeats.map((h) => h.id);
    const monitorMap = new Map(teamMonitors.map((m) => [m.id, m.name]));
    const heartbeatMap = new Map(teamHeartbeats.map((h) => [h.id, h.name]));

    type IncidentItem = {
      id: number;
      monitorId: number;
      monitorName: string;
      cause: string;
      title: string | null;
      description: string | null;
      hint: string | null;
      severity: "low" | "medium" | "high" | "critical" | null;
      status: "active" | "acknowledged" | "fixing" | "resolved" | "ongoing";
      startedAt: number;
      acknowledgedAt: number | null;
      fixingAt: number | null;
      resolvedAt: number | null;
      type: "monitor" | "heartbeat";
    };

    const allIncidents: IncidentItem[] = [];

    // Fetch monitor incidents (if not filtering by heartbeatId)
    if (!heartbeatId && monitorIds.length > 0) {
      const monitorConditions = [inArray(incident.monitorId, monitorIds)];

      if (monitorId) {
        const mid = Number(monitorId);
        if (!monitorIds.includes(mid)) {
          throw new HTTPException(404, { message: "Monitor not found" });
        }
        monitorConditions.push(eq(incident.monitorId, mid));
      }

      if (from) {
        monitorConditions.push(gte(incident.startedAt, new Date(Number(from))));
      }

      if (to) {
        monitorConditions.push(lte(incident.startedAt, new Date(Number(to))));
      }

      const monitorIncidents = await db
        .select()
        .from(incident)
        .where(and(...monitorConditions));

      for (const i of monitorIncidents) {
        allIncidents.push({
          id: i.id,
          monitorId: i.monitorId,
          monitorName: monitorMap.get(i.monitorId) ?? "Unknown",
          cause: i.cause,
          title: i.title,
          description: i.description,
          hint: i.hint,
          severity: i.severity,
          status: i.status,
          startedAt: i.startedAt.getTime(),
          acknowledgedAt: i.acknowledgedAt?.getTime() ?? null,
          fixingAt: i.fixingAt?.getTime() ?? null,
          resolvedAt: i.resolvedAt?.getTime() ?? null,
          type: "monitor",
        });
      }
    }

    // Fetch heartbeat incidents (if not filtering by monitorId)
    if (!monitorId && heartbeatIds.length > 0) {
      const hbConditions = [
        inArray(heartbeatIncident.heartbeatId, heartbeatIds),
      ];

      if (heartbeatId) {
        const hid = Number(heartbeatId);
        if (!heartbeatIds.includes(hid)) {
          throw new HTTPException(404, { message: "Heartbeat not found" });
        }
        hbConditions.push(eq(heartbeatIncident.heartbeatId, hid));
      }

      if (from) {
        hbConditions.push(
          gte(heartbeatIncident.startedAt, new Date(Number(from)))
        );
      }

      if (to) {
        hbConditions.push(
          lte(heartbeatIncident.startedAt, new Date(Number(to)))
        );
      }

      const hbIncidents = await db
        .select()
        .from(heartbeatIncident)
        .where(and(...hbConditions));

      for (const i of hbIncidents) {
        allIncidents.push({
          id: i.id,
          monitorId: i.heartbeatId,
          monitorName: heartbeatMap.get(i.heartbeatId) ?? "Unknown",
          cause: i.cause,
          title: null,
          description: null,
          hint: null,
          severity: null,
          status: i.status,
          startedAt: i.startedAt.getTime(),
          acknowledgedAt: null,
          fixingAt: null,
          resolvedAt: i.resolvedAt?.getTime() ?? null,
          type: "heartbeat",
        });
      }
    }

    // Sort all incidents by startedAt descending
    allIncidents.sort((a, b) => b.startedAt - a.startedAt);

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
        incidents: paginatedIncidents,
        hasMore,
        total,
      },
      200
    );
  });
}
