import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { heartbeat } from "../../../db/schema";
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

    const result = heartbeats.map((hb) => ({
      id: hb.id,
      teamId: hb.teamId,
      type: "heartbeat" as const,
      name: hb.name,
      slug: hb.slug,
      gracePeriod: hb.gracePeriod,
      status: hb.status,
      lastPingAt: hb.lastPingAt?.getTime() ?? null,
      createdAt: hb.createdAt.toISOString(),
      updatedAt: hb.updatedAt.toISOString(),
      pingUrl: `/api/public/ping/${hb.slug}`,
    }));

    return c.json(result, 200);
  });
}
