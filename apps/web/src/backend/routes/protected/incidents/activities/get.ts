import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { user } from "../../../../db/auth-schema";
import { incident, incidentActivity, monitor } from "../../../../db/schema";
import type { AppEnv } from "../../../../types";

const ActivitySchema = z.object({
  id: z.number(),
  incidentId: z.number(),
  userId: z.string().nullable(),
  userName: z.string().nullable(),
  userEmail: z.string().nullable(),
  userImage: z.string().nullable(),
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

const ResponseSchema = z.object({
  activities: z.array(ActivitySchema),
});

const route = createRoute({
  method: "get",
  path: "/:teamId/:incidentId/activities",
  tags: ["incidents"],
  summary: "Get incident activity timeline",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "Incident activities",
    },
  },
});

export function registerGetIncidentActivities(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { incidentId } = c.req.param();

    if (!teamContext) {
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

    const activities = await db
      .select({
        id: incidentActivity.id,
        incidentId: incidentActivity.incidentId,
        userId: incidentActivity.userId,
        type: incidentActivity.type,
        content: incidentActivity.content,
        metadata: incidentActivity.metadata,
        createdAt: incidentActivity.createdAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(incidentActivity)
      .leftJoin(user, eq(incidentActivity.userId, user.id))
      .where(eq(incidentActivity.incidentId, Number(incidentId)))
      .orderBy(desc(incidentActivity.createdAt));

    return c.json(
      {
        activities: activities.map((a) => ({
          id: a.id,
          incidentId: a.incidentId,
          userId: a.userId,
          userName: a.userName,
          userEmail: a.userEmail,
          userImage: a.userImage,
          type: a.type,
          content: a.content,
          metadata: a.metadata,
          createdAt: a.createdAt.getTime(),
        })),
      },
      200,
    );
  });
}
