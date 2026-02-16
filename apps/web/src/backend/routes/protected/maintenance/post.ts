import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { maintenance, maintenanceMonitor, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { CreateMaintenanceSchema, MaintenanceResponseSchema } from "./schemas";

const route = createRoute({
  method: "post",
  path: "/:teamId",
  tags: ["maintenance"],
  summary: "Schedule maintenance",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateMaintenanceSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: MaintenanceResponseSchema,
        },
      },
      description: "Maintenance scheduled",
    },
  },
});

export function registerPostMaintenance(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const requestedMonitorIds = Array.from(new Set(data.monitorIds));

    const monitors = await db
      .select({
        id: monitor.id,
        name: monitor.name,
        status: monitor.status,
      })
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

    const [created] = await db
      .insert(maintenance)
      .values({
        teamId: teamContext.teamId,
        reason: data.reason ?? null,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
      })
      .returning();

    await db.insert(maintenanceMonitor).values(
      requestedMonitorIds.map((monitorId) => ({
        maintenanceId: created.id,
        monitorId,
      })),
    );

    const monitorById = new Map(monitors.map((item) => [item.id, item]));
    const orderedMonitors = requestedMonitorIds.map(
      (monitorId) => monitorById.get(monitorId)!,
    );

    return c.json(
      {
        id: created.id,
        teamId: created.teamId,
        reason: created.reason,
        startsAt: created.startsAt.getTime(),
        endsAt: created.endsAt.getTime(),
        createdAt: created.createdAt.getTime(),
        monitorIds: requestedMonitorIds,
        monitors: orderedMonitors,
      },
      201,
    );
  });
}
