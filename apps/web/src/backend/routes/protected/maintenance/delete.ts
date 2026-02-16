import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { maintenance } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId/:maintenanceId",
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
      .select()
      .from(maintenance)
      .where(
        and(
          eq(maintenance.id, Number(maintenanceId)),
          eq(maintenance.teamId, teamContext.teamId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HTTPException(404, { message: "Maintenance not found" });
    }

    await db
      .delete(maintenance)
      .where(eq(maintenance.id, Number(maintenanceId)));

    return c.body(null, 204);
  });
}
