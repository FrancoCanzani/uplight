import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { maintenance, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const route = createRoute({
  method: "delete",
  path: "/:maintenanceId",
  tags: ["maintenance"],
  summary: "Delete maintenance window",
  responses: {
    204: {
      description: "Maintenance deleted",
    },
  },
});

export function registerDeleteMaintenance(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { maintenanceId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const [existing] = await db
      .select({
        maintenance: maintenance,
        monitor: monitor,
      })
      .from(maintenance)
      .innerJoin(monitor, eq(maintenance.monitorId, monitor.id))
      .where(
        and(
          eq(maintenance.id, Number(maintenanceId)),
          eq(monitor.teamId, teamContext.teamId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new HTTPException(404, { message: "Maintenance not found" });
    }

    await db.delete(maintenance).where(eq(maintenance.id, Number(maintenanceId)));

    return c.body(null, 204);
  });
}

