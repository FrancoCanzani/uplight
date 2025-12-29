import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { heartbeat } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId/:heartbeatId",
  tags: ["heartbeats"],
  summary: "Delete a heartbeat",
  description: "Deletes an existing heartbeat monitor",
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
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
      description: "Heartbeat deleted successfully",
    },
    404: {
      description: "Heartbeat not found",
    },
  },
});

export function registerDeleteHeartbeat(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const { heartbeatId } = c.req.valid("param");
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

    await db.delete(heartbeat).where(eq(heartbeat.id, Number(heartbeatId)));

    return c.json({ success: true }, 200);
  });
}
