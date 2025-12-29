import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { heartbeat } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { HeartbeatResponseSchema } from "./schemas";

const route = createRoute({
  method: "patch",
  path: "/:teamId/:heartbeatId/status",
  tags: ["heartbeats"],
  summary: "Update heartbeat status",
  description: "Pause or resume a heartbeat monitor",
  request: {
    params: z.object({
      teamId: z.string(),
      heartbeatId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.enum(["paused", "initializing"]),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: HeartbeatResponseSchema,
        },
      },
      description: "Heartbeat status updated successfully",
    },
    404: {
      description: "Heartbeat not found",
    },
  },
});

export function registerPatchHeartbeatStatus(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const { heartbeatId } = c.req.valid("param");
    const { status } = c.req.valid("json");
    const db = createDb(c.env.DB);

    const [existing] = await db
      .select()
      .from(heartbeat)
      .where(
        and(
          eq(heartbeat.id, Number(heartbeatId)),
          eq(heartbeat.teamId, teamContext.teamId)
        )
      );

    if (!existing) {
      throw new HTTPException(404, { message: "Heartbeat not found" });
    }

    const [updated] = await db
      .update(heartbeat)
      .set({ status })
      .where(eq(heartbeat.id, Number(heartbeatId)))
      .returning();

    return c.json(
      {
        id: updated.id,
        teamId: updated.teamId,
        type: "heartbeat" as const,
        name: updated.name,
        slug: updated.slug,
        gracePeriod: updated.gracePeriod,
        status: updated.status,
        lastPingAt: updated.lastPingAt?.getTime() ?? null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        pingUrl: `/api/public/ping/${updated.slug}`,
      },
      200
    );
  });
}
