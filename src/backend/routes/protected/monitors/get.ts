import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { MonitorResponseSchema } from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId/:monitorId",
  tags: ["monitors"],
  summary: "Get monitor",
  description: "Get a monitor for a team",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MonitorResponseSchema,
        },
      },
      description: "Selected monitor",
    },
  },
});

export function registerGetMonitor(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { monitorId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const result = await db
      .select()
      .from(monitor)
      .where(
        and(
          eq(monitor.teamId, teamContext.teamId),
          eq(monitor.id, Number(monitorId))
        )
      )
      .limit(1);

    if (!result[0]) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    return c.json(result[0], 200);
  });
}
