import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { desc, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { maintenance, maintenanceMonitor, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { MaintenanceResponseSchema } from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId",
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

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const windows = await db
      .select()
      .from(maintenance)
      .where(eq(maintenance.teamId, teamContext.teamId))
      .orderBy(desc(maintenance.startsAt));

    if (windows.length === 0) {
      return c.json([], 200);
    }

    const windowIds = windows.map((window) => window.id);

    const assignments = await db
      .select({
        maintenanceId: maintenanceMonitor.maintenanceId,
        id: monitor.id,
        name: monitor.name,
        status: monitor.status,
      })
      .from(maintenanceMonitor)
      .innerJoin(monitor, eq(maintenanceMonitor.monitorId, monitor.id))
      .where(inArray(maintenanceMonitor.maintenanceId, windowIds));

    const assignmentsByWindowId = new Map<
      number,
      Array<{
        id: number;
        name: string;
        status:
          | "up"
          | "down"
          | "degraded"
          | "maintenance"
          | "paused"
          | "initializing";
      }>
    >();

    for (const assignment of assignments) {
      const existing =
        assignmentsByWindowId.get(assignment.maintenanceId) ?? [];
      existing.push({
        id: assignment.id,
        name: assignment.name,
        status: assignment.status,
      });
      assignmentsByWindowId.set(assignment.maintenanceId, existing);
    }

    return c.json(
      windows.map((window) => {
        const monitorsForWindow = assignmentsByWindowId.get(window.id) ?? [];
        return {
          id: window.id,
          teamId: window.teamId,
          reason: window.reason,
          startsAt: window.startsAt.getTime(),
          endsAt: window.endsAt.getTime(),
          createdAt: window.createdAt.getTime(),
          monitorIds: monitorsForWindow.map((item) => item.id),
          monitors: monitorsForWindow,
        };
      }),
      200,
    );
  });
}
