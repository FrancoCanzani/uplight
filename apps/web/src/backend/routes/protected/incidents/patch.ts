import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { and, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { incident, incidentActivity, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const PatchIncidentSchema = z.object({
  status: z.enum([
    "ongoing",
    "acknowledged",
    "fixing",
    "recovered",
    "resolved",
  ]),
});

const ResponseSchema = z.object({
  id: z.number(),
  status: z.enum([
    "ongoing",
    "acknowledged",
    "fixing",
    "recovered",
    "resolved",
  ]),
  acknowledgedAt: z.number().nullable(),
  fixingAt: z.number().nullable(),
  recoveredAt: z.number().nullable(),
  resolvedAt: z.number().nullable(),
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
    const user = c.get("user");
    const { incidentId } = c.req.param();
    const { status } = c.req.valid("json");

    if (!teamContext || !user) {
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
          inArray(incident.monitorId, monitorIds),
        ),
      )
      .limit(1);

    if (!existingIncident) {
      throw new HTTPException(404, { message: "Incident not found" });
    }

    const updateData: {
      status: "ongoing" | "acknowledged" | "fixing" | "recovered" | "resolved";
      acknowledgedAt?: Date;
      fixingAt?: Date;
      recoveredAt?: Date;
      resolvedAt?: Date;
    } = { status };

    if (status === "acknowledged" && !existingIncident.acknowledgedAt) {
      updateData.acknowledgedAt = new Date(now);
    }

    if (status === "fixing" && !existingIncident.fixingAt) {
      updateData.fixingAt = new Date(now);
    }

    if (status === "recovered" && !existingIncident.recoveredAt) {
      updateData.recoveredAt = new Date(now);
    }

    if (status === "resolved" && !existingIncident.resolvedAt) {
      updateData.resolvedAt = new Date(now);
    }

    const [updated] = await db
      .update(incident)
      .set(updateData)
      .where(eq(incident.id, Number(incidentId)))
      .returning();

    await db.insert(incidentActivity).values({
      incidentId: Number(incidentId),
      userId: user.id,
      type: "status_change",
      metadata: JSON.stringify({
        from: existingIncident.status,
        to: status,
      }),
    });

    return c.json(
      {
        id: updated.id,
        status: updated.status,
        acknowledgedAt: updated.acknowledgedAt?.getTime() ?? null,
        fixingAt: updated.fixingAt?.getTime() ?? null,
        recoveredAt: updated.recoveredAt?.getTime() ?? null,
        resolvedAt: updated.resolvedAt?.getTime() ?? null,
      },
      200,
    );
  });
}
