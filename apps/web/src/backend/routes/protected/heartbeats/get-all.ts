import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { desc, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import {
  heartbeat,
  heartbeatIncident,
  heartbeatPing,
} from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { HeartbeatResponseSchema } from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId",
  tags: ["heartbeats"],
  summary: "Get all heartbeats",
  description: "Gets all heartbeat monitors for a team",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(HeartbeatResponseSchema),
        },
      },
      description: "List of heartbeats",
    },
  },
});

export function registerGetAllHeartbeats(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const heartbeats = await db
      .select()
      .from(heartbeat)
      .where(eq(heartbeat.teamId, teamContext.teamId));

    if (heartbeats.length === 0) {
      return c.json([], 200);
    }

    const heartbeatIds = heartbeats.map((hb) => hb.id);

    const allPings = await db
      .select()
      .from(heartbeatPing)
      .where(inArray(heartbeatPing.heartbeatId, heartbeatIds))
      .orderBy(desc(heartbeatPing.pingedAt));

    const allIncidents = await db
      .select()
      .from(heartbeatIncident)
      .where(inArray(heartbeatIncident.heartbeatId, heartbeatIds));

    const pingsByHeartbeat = new Map<number, typeof allPings>();
    for (const ping of allPings) {
      const existing = pingsByHeartbeat.get(ping.heartbeatId) ?? [];
      if (existing.length < 50) {
        existing.push(ping);
        pingsByHeartbeat.set(ping.heartbeatId, existing);
      }
    }

    const incidentCountByHeartbeat = new Map<number, number>();
    for (const incident of allIncidents) {
      const count = incidentCountByHeartbeat.get(incident.heartbeatId) ?? 0;
      incidentCountByHeartbeat.set(incident.heartbeatId, count + 1);
    }

    const result = heartbeats.map((hb) => ({
      id: hb.id,
      teamId: hb.teamId,
      type: "heartbeat" as const,
      name: hb.name,
      slug: hb.slug,
      period: hb.period,
      gracePeriod: hb.gracePeriod,
      status: hb.status,
      lastPingAt: hb.lastPingAt?.getTime() ?? null,
      createdAt: hb.createdAt.toISOString(),
      updatedAt: hb.updatedAt.toISOString(),
      pingUrl: `/api/public/ping/${hb.slug}`,
      recentPings: (pingsByHeartbeat.get(hb.id) ?? []).map((p) => ({
        id: p.id,
        method: p.method,
        userAgent: p.userAgent,
        ip: p.ip,
        pingedAt: p.pingedAt.getTime(),
      })),
      incidentCount: incidentCountByHeartbeat.get(hb.id) ?? 0,
    }));

    return c.json(result, 200);
  });
}
