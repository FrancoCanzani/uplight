import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor, incident } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const IncidentResponseSchema = z.object({
  id: z.number(),
  monitorId: z.number(),
  monitorName: z.string(),
  cause: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  hint: z.string().nullable(),
  severity: z.enum(["low", "medium", "high", "critical"]).nullable(),
  status: z.enum(["active", "acknowledged", "fixing", "resolved"]),
  postMortemTitle: z.string().nullable(),
  postMortemContent: z.string().nullable(),
  startedAt: z.number(),
  acknowledgedAt: z.number().nullable(),
  fixingAt: z.number().nullable(),
  resolvedAt: z.number().nullable(),
});

const route = createRoute({
  method: "get",
  path: "/:teamId/:incidentId",
  tags: ["incidents"],
  summary: "Get single incident",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IncidentResponseSchema,
        },
      },
      description: "Single incident",
    },
  },
});

export function registerGetIncident(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { incidentId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const [result] = await db
      .select()
      .from(incident)
      .innerJoin(monitor, eq(incident.monitorId, monitor.id))
      .where(
        and(
          eq(incident.id, Number(incidentId)),
          eq(monitor.teamId, teamContext.teamId)
        )
      )
      .limit(1);

    if (!result) {
      throw new HTTPException(404, { message: "Incident not found" });
    }

    return c.json(
      {
        id: result.incident.id,
        monitorId: result.incident.monitorId,
        monitorName: result.monitor.name,
        cause: result.incident.cause,
        title: result.incident.title,
        description: result.incident.description,
        hint: result.incident.hint,
        severity: result.incident.severity,
        status: result.incident.status,
        postMortemTitle: result.incident.postMortemTitle,
        postMortemContent: result.incident.postMortemContent,
        startedAt: result.incident.startedAt.getTime(),
        acknowledgedAt: result.incident.acknowledgedAt?.getTime() ?? null,
        fixingAt: result.incident.fixingAt?.getTime() ?? null,
        resolvedAt: result.incident.resolvedAt?.getTime() ?? null,
      },
      200
    );
  });
}
