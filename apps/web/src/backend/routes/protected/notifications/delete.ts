import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { notifier } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId/:notifierId",
  tags: ["notifications"],
  summary: "Delete a notifier",
  responses: {
    204: {
      description: "Notifier deleted",
    },
  },
});

export function registerDeleteNotifier(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { teamId, notifierId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    if (teamContext.teamId !== Number(teamId)) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    const db = createDb(c.env.DB);

    const existing = await db
      .select()
      .from(notifier)
      .where(
        and(
          eq(notifier.id, Number(notifierId)),
          eq(notifier.teamId, teamContext.teamId),
        ),
      )
      .limit(1);

    if (!existing[0]) {
      throw new HTTPException(404, { message: "Notifier not found" });
    }

    await db.delete(notifier).where(eq(notifier.id, Number(notifierId)));

    return c.body(null, 204);
  });
}
