import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor, incident } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const UpdateIncidentSchema = z.object({
  postMortemTitle: z.string().nullable().optional(),
  postMortemContent: z.string().nullable().optional(),
});

const ResponseSchema = z.object({
  id: z.number(),
  postMortemTitle: z.string().nullable(),
  postMortemContent: z.string().nullable(),
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
    const { incidentId } = c.req.param();
    const body = c.req.valid("json");

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
          eq(monitor.teamId, teamContext.teamId)
        )
      )
      .limit(1);

    if (!existingIncident) {
      throw new HTTPException(404, { message: "Incident not found" });
    }

    const updateData: {
      postMortemTitle?: string | null;
      postMortemContent?: string | null;
    } = {};

    if (body.postMortemTitle !== undefined) {
      updateData.postMortemTitle = body.postMortemTitle;
    }

    if (body.postMortemContent !== undefined) {
      updateData.postMortemContent = body.postMortemContent;
    }

    const [updated] = await db
      .update(incident)
      .set(updateData)
      .where(eq(incident.id, Number(incidentId)))
      .returning();

    return c.json(
      {
        id: updated.id,
        postMortemTitle: updated.postMortemTitle,
        postMortemContent: updated.postMortemContent,
      },
      200
    );
  });
}
