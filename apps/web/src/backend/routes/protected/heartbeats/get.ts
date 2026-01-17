import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq, and, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { heartbeat, heartbeatPing, heartbeatIncident } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { HeartbeatResponseSchema } from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId/:heartbeatId",
  tags: ["heartbeats"],
  summary: "Get a heartbeat",
  description: "Gets a single heartbeat monitor by ID",
  request: {
    params: z.object({
      teamId: z.string(),
      heartbeatId: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: HeartbeatResponseSchema,
        },
      },
      description: "Heartbeat details",
    },
    404: {
      description: "Heartbeat not found",
    },
  },
});

export function registerGetHeartbeat(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const { heartbeatId } = c.req.valid("param");
    const db = createDb(c.env.DB);

    const [hb] = await db
      .select()
      .from(heartbeat)
      .where(
        and(
          eq(heartbeat.id, Number(heartbeatId)),
          eq(heartbeat.teamId, teamContext.teamId)
        )
      );

    if (!hb) {
      throw new HTTPException(404, { message: "Heartbeat not found" });
    }

    // Fetch recent pings (last 50)
    const pings = await db
      .select()
      .from(heartbeatPing)
      .where(eq(heartbeatPing.heartbeatId, hb.id))
      .orderBy(desc(heartbeatPing.pingedAt))
      .limit(50);

    // Fetch incident count
    const incidents = await db
      .select()
      .from(heartbeatIncident)
      .where(eq(heartbeatIncident.heartbeatId, hb.id));

    return c.json(
      {
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
        recentPings: pings.map((p) => ({
          id: p.id,
          method: p.method,
          userAgent: p.userAgent,
          ip: p.ip,
          pingedAt: p.pingedAt.getTime(),
        })),
        incidentCount: incidents.length,
      },
      200
    );
  });
}
