import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { eq, and, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor, incident } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const PatchIncidentSchema = z.object({
  status: z.enum(["active", "acknowledged", "fixing"]),
});

const ResponseSchema = z.object({
  id: z.number(),
  status: z.enum(["active", "acknowledged", "fixing", "resolved"]),
  acknowledgedAt: z.number().nullable(),
  fixingAt: z.number().nullable(),
});

const route = createRoute({
  method: "patch",
  path: "/:teamId/:incidentId",
  tags: ["incidents"],
  summary: "Update incident status",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PatchIncidentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "Updated incident",
    },
  },
});

export function registerPatchIncident(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { incidentId } = c.req.param();
    const { status } = c.req.valid("json");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);
    const now = Date.now();

    const teamMonitorIds = await db
      .select({ id: monitor.id })
      .from(monitor)
      .where(eq(monitor.teamId, teamContext.teamId));

    const monitorIds = teamMonitorIds.map((m) => m.id);

    if (monitorIds.length === 0) {
      throw new HTTPException(404, { message: "Incident not found" });
    }

    const [existingIncident] = await db
      .select()
      .from(incident)
      .where(
        and(
          eq(incident.id, Number(incidentId)),
          inArray(incident.monitorId, monitorIds)
        )
      )
      .limit(1);

    if (!existingIncident) {
      throw new HTTPException(404, { message: "Incident not found" });
    }

    const updateData: {
      status: "active" | "acknowledged" | "fixing";
      acknowledgedAt?: Date;
      fixingAt?: Date;
    } = { status };

    if (status === "acknowledged" && !existingIncident.acknowledgedAt) {
      updateData.acknowledgedAt = new Date(now);
    }

    if (status === "fixing" && !existingIncident.fixingAt) {
      updateData.fixingAt = new Date(now);
    }

    const [updated] = await db
      .update(incident)
      .set(updateData)
      .where(eq(incident.id, Number(incidentId)))
      .returning();

    return c.json(
      {
        id: updated.id,
        status: updated.status,
        acknowledgedAt: updated.acknowledgedAt?.getTime() ?? null,
        fixingAt: updated.fixingAt?.getTime() ?? null,
      },
      200
    );
  });
}
