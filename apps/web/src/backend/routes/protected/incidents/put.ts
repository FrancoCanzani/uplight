import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { incident, incidentActivity, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const UpdateIncidentSchema = z.object({
  postMortemTitle: z.string().nullable().optional(),
  postMortemContent: z.string().nullable().optional(),
  incidentType: z
    .enum(["availability", "performance", "security", "data", "other"])
    .nullable()
    .optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).nullable().optional(),
  assignees: z.array(z.string()).optional(),
});

const ResponseSchema = z.object({
  id: z.number(),
  postMortemTitle: z.string().nullable(),
  postMortemContent: z.string().nullable(),
  incidentType: z
    .enum(["availability", "performance", "security", "data", "other"])
    .nullable(),
  severity: z.enum(["low", "medium", "high", "critical"]).nullable(),
  assignees: z.array(z.string()).nullable(),
});

const route = createRoute({
  method: "put",
  path: "/:teamId/:incidentId",
  tags: ["incidents"],
  summary: "Update incident post mortem",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateIncidentSchema,
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

export function registerPutIncident(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const user = c.get("user");
    const { incidentId } = c.req.param();
    const body = c.req.valid("json");

    if (!teamContext || !user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const [existingIncident] = await db
      .select({
        id: incident.id,
        incidentType: incident.incidentType,
        severity: incident.severity,
        assignees: incident.assignees,
      })
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

    const updateData: {
      postMortemTitle?: string | null;
      postMortemContent?: string | null;
      incidentType?:
        | "availability"
        | "performance"
        | "security"
        | "data"
        | "other"
        | null;
      severity?: "low" | "medium" | "high" | "critical" | null;
      assignees?: string | null;
    } = {};

    if (body.postMortemTitle !== undefined) {
      updateData.postMortemTitle = body.postMortemTitle;
    }

    if (body.postMortemContent !== undefined) {
      updateData.postMortemContent = body.postMortemContent;
    }

    if (body.incidentType !== undefined) {
      updateData.incidentType = body.incidentType;
    }

    if (body.severity !== undefined) {
      updateData.severity = body.severity;
    }

    if (body.assignees !== undefined) {
      updateData.assignees =
        body.assignees.length > 0 ? JSON.stringify(body.assignees) : null;
    }

    const [updated] = await db
      .update(incident)
      .set(updateData)
      .where(eq(incident.id, Number(incidentId)))
      .returning();

    if (
      body.incidentType !== undefined &&
      body.incidentType !== existingIncident.incidentType
    ) {
      await db.insert(incidentActivity).values({
        incidentId: Number(incidentId),
        userId: user.id,
        type: "type_changed",
        metadata: JSON.stringify({
          from: existingIncident.incidentType,
          to: body.incidentType,
        }),
      });
    }

    if (
      body.severity !== undefined &&
      body.severity !== existingIncident.severity
    ) {
      await db.insert(incidentActivity).values({
        incidentId: Number(incidentId),
        userId: user.id,
        type: "severity_changed",
        metadata: JSON.stringify({
          from: existingIncident.severity,
          to: body.severity,
        }),
      });
    }

    if (body.assignees !== undefined) {
      let oldAssignees: string[] = [];
      if (existingIncident.assignees) {
        try {
          oldAssignees = JSON.parse(existingIncident.assignees);
        } catch {
          oldAssignees = [];
        }
      }
      const newAssignees = body.assignees;

      const added = newAssignees.filter(
        (id: string) => !oldAssignees.includes(id),
      );
      const removed = oldAssignees.filter(
        (id: string) => !newAssignees.includes(id),
      );

      for (const userId of added) {
        await db.insert(incidentActivity).values({
          incidentId: Number(incidentId),
          userId: user.id,
          type: "assignee_added",
          metadata: JSON.stringify({ assignedUserId: userId }),
        });
      }

      for (const userId of removed) {
        await db.insert(incidentActivity).values({
          incidentId: Number(incidentId),
          userId: user.id,
          type: "assignee_removed",
          metadata: JSON.stringify({ removedUserId: userId }),
        });
      }
    }

    let assignees: string[] = [];
    if (updated.assignees) {
      try {
        assignees = JSON.parse(updated.assignees);
      } catch {
        assignees = [];
      }
    }

    return c.json(
      {
        id: updated.id,
        postMortemTitle: updated.postMortemTitle,
        postMortemContent: updated.postMortemContent,
        incidentType: updated.incidentType,
        severity: updated.severity,
        assignees,
      },
      200,
    );
  });
}
