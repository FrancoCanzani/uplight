import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { maintenance, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { CreateMaintenanceSchema, MaintenanceResponseSchema } from "./schemas";

const route = createRoute({
  method: "post",
  path: "/",
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

    const [mon] = await db
      .select()
      .from(monitor)
      .where(
        and(
          eq(monitor.id, data.monitorId),
          eq(monitor.teamId, teamContext.teamId)
        )
      )
      .limit(1);

    if (!mon) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    const [created] = await db
      .insert(maintenance)
      .values({
        monitorId: data.monitorId,
        reason: data.reason ?? null,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
      })
      .returning();

    return c.json(
      {
        id: created.id,
        monitorId: created.monitorId,
        reason: created.reason,
        startsAt: created.startsAt.getTime(),
        endsAt: created.endsAt.getTime(),
        createdAt: created.createdAt.getTime(),
      },
      201
    );
  });
}

