import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { maintenance, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { UpdateMaintenanceSchema, MaintenanceResponseSchema } from "./schemas";

const route = createRoute({
  method: "put",
  path: "/:maintenanceId",
  tags: ["maintenance"],
  summary: "Update maintenance window",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateMaintenanceSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MaintenanceResponseSchema,
        },
      },
      description: "Maintenance updated",
    },
  },
});

export function registerPutMaintenance(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { maintenanceId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const data = c.req.valid("json");
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

    const updateData: Record<string, Date | string | null> = {};
    if (data.reason !== undefined) updateData.reason = data.reason ?? null;
    if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
    if (data.endsAt !== undefined) updateData.endsAt = new Date(data.endsAt);

    const [updated] = await db
      .update(maintenance)
      .set(updateData)
      .where(eq(maintenance.id, Number(maintenanceId)))
      .returning();

    return c.json(
      {
        id: updated.id,
        monitorId: updated.monitorId,
        reason: updated.reason,
        startsAt: updated.startsAt.getTime(),
        endsAt: updated.endsAt.getTime(),
        createdAt: updated.createdAt.getTime(),
      },
      200
    );
  });
}

