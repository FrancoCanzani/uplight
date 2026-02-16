import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const BulkActionSchema = z.object({
  action: z.enum(["pause", "resume", "delete"]),
  monitorIds: z.array(z.number()).min(1).max(100),
});

const route = createRoute({
  method: "post",
  path: "/:teamId/bulk",
  tags: ["monitors"],
  summary: "Bulk monitor action",
  description: "Pause, resume, or delete multiple monitors at once",
  request: {
    body: {
      content: {
        "application/json": {
          schema: BulkActionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            affected: z.number(),
          }),
        },
      },
      description: "Bulk action completed",
    },
  },
});

export function registerBulkMonitorAction(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const { action, monitorIds } = c.req.valid("json");
    const db = createDb(c.env.DB);

    const teamFilter = and(
      inArray(monitor.id, monitorIds),
      eq(monitor.teamId, teamContext.teamId),
    );

    let affected: { id: number }[];

    switch (action) {
      case "pause":
        affected = await db
          .update(monitor)
          .set({ status: "paused", updatedAt: new Date() })
          .where(teamFilter)
          .returning({ id: monitor.id });
        break;
      case "resume":
        affected = await db
          .update(monitor)
          .set({ status: "initializing", updatedAt: new Date() })
          .where(teamFilter)
          .returning({ id: monitor.id });
        break;
      case "delete":
        affected = await db
          .delete(monitor)
          .where(teamFilter)
          .returning({ id: monitor.id });
        break;
    }

    return c.json({ affected: affected.length }, 200);
  });
}
