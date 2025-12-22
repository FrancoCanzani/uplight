import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import type { AppEnv } from "../../types";

const HeartbeatSchema = z.object({
  monitorId: z.string(),
  status: z.enum(["up", "down"]),
  responseTime: z.number().int().positive().optional(),
  message: z.string().optional(),
});

export function registerHeartbeat(api: OpenAPIHono<AppEnv>) {
  return api.post("/heartbeat", async (c) => {
    const body = await c.req.json();

    const result = HeartbeatSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid request", issues: result.error.issues },
        400
      );
    }

    const { monitorId, status } = result.data;

    if (!c.env.DB) {
      return c.json({ error: "Database not available" }, 500);
    }

    return c.json({
      monitorId,
      status,
      receivedAt: new Date().toISOString(),
    });
  });
}
