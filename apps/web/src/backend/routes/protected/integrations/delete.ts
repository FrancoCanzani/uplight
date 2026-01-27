import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { integration } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId/:integrationId",
  tags: ["integrations"],
  summary: "Delete an integration",
  responses: {
    204: {
      description: "Integration deleted",
    },
  },
});

export function registerDeleteIntegration(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { teamId, integrationId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    if (teamContext.teamId !== Number(teamId)) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    const db = createDb(c.env.DB);

    const existing = await db
      .select()
      .from(integration)
      .where(
        and(
          eq(integration.id, Number(integrationId)),
          eq(integration.teamId, teamContext.teamId),
        ),
      )
      .limit(1);

    if (!existing[0]) {
      throw new HTTPException(404, { message: "Integration not found" });
    }

    await db.delete(integration).where(eq(integration.id, Number(integrationId)));

    return c.body(null, 204);
  });
}
