import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "../../../types";
import { createDb } from "../../../db";
import { monitor } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

const PatchMonitorParamsSchema = z.object({
  teamId: z.string().openapi({ param: { name: "teamId", in: "path" } }),
  monitorId: z.string().openapi({ param: { name: "monitorId", in: "path" } }),
});

const PatchMonitorBodySchema = z.object({
  status: z.enum(["paused", "initializing"]),
});

const route = createRoute({
  method: "patch",
  path: "/:teamId/:monitorId/status",
  request: {
    params: PatchMonitorParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: PatchMonitorBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Monitor status updated",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            status: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Monitor not found",
    },
  },
});

export function registerPatchMonitorStatus(app: OpenAPIHono<AppEnv>) {
  app.openapi(route, async (c) => {
    const { teamId, monitorId } = c.req.valid("param");
    const { status } = c.req.valid("json");

    const result = await createDb(c.env.DB)
      .update(monitor)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(monitor.id, parseInt(monitorId, 10)),
          eq(monitor.teamId, parseInt(teamId, 10))
        )
      )
      .returning({ id: monitor.id, status: monitor.status });

    if (result.length === 0) {
      return c.json({ error: "Monitor not found" }, 404);
    }

    return c.json(result[0], 200);
  });
}
