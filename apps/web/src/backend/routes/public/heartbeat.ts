import { OpenAPIHono } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { createDb } from "../../db";
import { heartbeat, heartbeatIncident } from "../../db/schema";
import type { AppEnv } from "../../types";

export function registerHeartbeat(api: OpenAPIHono<AppEnv>) {
  return api.get("/ping/:slug", async (c) => {
    const { slug } = c.req.param();

    const db = createDb(c.env.DB);
    const now = Date.now();

    const [hb] = await db
      .select()
      .from(heartbeat)
      .where(eq(heartbeat.slug, slug));

    if (!hb) {
      return c.text("Not found", 404);
    }

    if (hb.status === "paused") {
      return c.text("OK", 200);
    }

    const wasDown = hb.status === "down";

    await db
      .update(heartbeat)
      .set({
        lastPingAt: new Date(now),
        status: "up",
      })
      .where(eq(heartbeat.id, hb.id));

    if (wasDown) {
      await db
        .update(heartbeatIncident)
        .set({
          status: "resolved",
          resolvedAt: new Date(now),
        })
        .where(
          and(
            eq(heartbeatIncident.heartbeatId, hb.id),
            eq(heartbeatIncident.status, "ongoing")
          )
        );
    }

    return c.text("OK", 200);
  });
}
