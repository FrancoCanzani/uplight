import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { incident, incidentActivity, monitor } from "../../../../db/schema";
import type { AppEnv } from "../../../../types";

const CreateActivitySchema = z.object({
  content: z.string(),
});

const ResponseSchema = z.object({
  id: z.number(),
  incidentId: z.number(),
  userId: z.string().nullable(),
  type: z.enum([
    "status_change",
    "assignee_added",
    "assignee_removed",
    "comment",
    "type_changed",
    "severity_changed",
  ]),
  content: z.string().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.number(),
});

const route = createRoute({
  method: "post",
  path: "/:teamId/:incidentId/activities",
  tags: ["incidents"],
  summary: "Add comment to incident",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateActivitySchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "Activity created",
    },
  },
});

export function registerPostIncidentActivity(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const user = c.get("user");
    const { incidentId } = c.req.param();
    const { content } = c.req.valid("json");

    if (!teamContext || !user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const [existingIncident] = await db
      .select({ id: incident.id })
      .from(incident)
      .innerJoin(monitor, eq(incident.monitorId, monitor.id))
      .where(
        and(
          eq(incident.id, Number(incidentId)),
          eq(monitor.teamId, teamContext.teamId),
        ),
      )
      .limit(1);

    if (!existingIncident) {
      throw new HTTPException(404, { message: "Incident not found" });
    }

    const [created] = await db
      .insert(incidentActivity)
      .values({
        incidentId: Number(incidentId),
        userId: user.id,
        type: "comment",
        content,
      })
      .returning();

    return c.json(
      {
        id: created.id,
        incidentId: created.incidentId,
        userId: created.userId,
        type: created.type,
        content: created.content,
        metadata: created.metadata,
        createdAt: created.createdAt.getTime(),
      },
      201,
    );
  });
}
