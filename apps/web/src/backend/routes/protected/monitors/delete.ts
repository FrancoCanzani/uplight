import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId/:monitorId",
  tags: ["monitors"],
  summary: "Delete monitor",
  description: "Deletes a monitor for a team",
  responses: {
    204: {
      description: "Monitor deleted",
    },
  },
});

export function registerDeleteMonitor(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { monitorId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const [existing] = await db
      .select()
      .from(monitor)
      .where(
        and(
          eq(monitor.id, Number(monitorId)),
          eq(monitor.teamId, teamContext.teamId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    await db.delete(monitor).where(eq(monitor.id, Number(monitorId)));

    return c.body(null, 204);
  });
}
