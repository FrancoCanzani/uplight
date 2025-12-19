import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { maintenance, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { MaintenanceResponseSchema } from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId/:monitorId",
  tags: ["maintenance"],
  summary: "List maintenance windows",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(MaintenanceResponseSchema),
        },
      },
      description: "List of maintenance windows",
    },
  },
});

export function registerGetAllMaintenance(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { monitorId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const [mon] = await db
      .select()
      .from(monitor)
      .where(
        and(
          eq(monitor.id, Number(monitorId)),
          eq(monitor.teamId, teamContext.teamId)
        )
      )
      .limit(1);

    if (!mon) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    const results = await db
      .select()
      .from(maintenance)
      .where(eq(maintenance.monitorId, Number(monitorId)));

    return c.json(
      results.map((m) => ({
        id: m.id,
        monitorId: m.monitorId,
        reason: m.reason,
        startsAt: m.startsAt.getTime(),
        endsAt: m.endsAt.getTime(),
        createdAt: m.createdAt.getTime(),
      })),
      200
    );
  });
}
