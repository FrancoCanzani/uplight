import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { MonitorResponseSchema } from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId",
  tags: ["monitors"],
  summary: "Get all monitors",
  description: "Gets all monitors for a team",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(MonitorResponseSchema),
        },
      },
      description: "List of monitors",
    },
  },
});

export function registerGetAllMonitors(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const reuslt = await db
      .select()
      .from(monitor)
      .where(eq(monitor.teamId, teamContext.teamId));

    return c.json(reuslt, 200);
  });
}
