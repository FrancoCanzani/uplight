import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { maintenance, maintenanceMonitor, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { MaintenanceResponseSchema, UpdateMaintenanceSchema } from "./schemas";

const route = createRoute({
  method: "put",
  path: "/:teamId/:maintenanceId",
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

    const requestedMonitorIds =
      data.monitorIds !== undefined
        ? Array.from(new Set(data.monitorIds))
        : undefined;

    if (requestedMonitorIds) {
      const monitors = await db
        .select({ id: monitor.id })
        .from(monitor)
        .where(
          and(
            eq(monitor.teamId, teamContext.teamId),
            inArray(monitor.id, requestedMonitorIds),
          ),
        );

      if (monitors.length !== requestedMonitorIds.length) {
        throw new HTTPException(404, {
          message: "One or more monitors not found",
        });
      }
    }

    const updateData: Record<string, Date | string | null> = {};
    if (data.reason !== undefined) updateData.reason = data.reason ?? null;
    if (data.startsAt !== undefined)
      updateData.startsAt = new Date(data.startsAt);
    if (data.endsAt !== undefined) updateData.endsAt = new Date(data.endsAt);

    if (Object.keys(updateData).length > 0) {
      await db
        .update(maintenance)
        .set(updateData)
        .where(eq(maintenance.id, Number(maintenanceId)));
    }

    if (requestedMonitorIds) {
      await db
        .delete(maintenanceMonitor)
        .where(eq(maintenanceMonitor.maintenanceId, Number(maintenanceId)));

      await db.insert(maintenanceMonitor).values(
        requestedMonitorIds.map((monitorId) => ({
          maintenanceId: Number(maintenanceId),
          monitorId,
        })),
      );
    }

    const [updated] = await db
      .select()
      .from(maintenance)
      .where(eq(maintenance.id, Number(maintenanceId)))
      .limit(1);

    const assignments = await db
      .select({
        id: monitor.id,
        name: monitor.name,
        status: monitor.status,
      })
      .from(maintenanceMonitor)
      .innerJoin(monitor, eq(maintenanceMonitor.monitorId, monitor.id))
      .where(eq(maintenanceMonitor.maintenanceId, Number(maintenanceId)));

    return c.json(
      {
        id: updated.id,
        teamId: updated.teamId,
        reason: updated.reason,
        startsAt: updated.startsAt.getTime(),
        endsAt: updated.endsAt.getTime(),
        createdAt: updated.createdAt.getTime(),
        monitorIds: assignments.map((item) => item.id),
        monitors: assignments,
      },
      200,
    );
  });
}
