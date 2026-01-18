import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { statusPage, statusPageMonitor } from "../../../../db/schema";
import type { AppEnv } from "../../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId/:pageId/monitors/:monitorId",
  tags: ["status-pages"],
  summary: "Remove a monitor from a status page",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
      monitorId: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Monitor removed successfully",
    },
  },
});

export function registerDeleteMonitor(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { pageId, monitorId } = c.req.valid("param");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const [page] = await db
      .select()
      .from(statusPage)
      .where(
        and(
          eq(statusPage.id, Number(pageId)),
          eq(statusPage.teamId, teamContext.teamId),
        ),
      )
      .limit(1);

    if (!page) {
      throw new HTTPException(404, { message: "Status page not found" });
    }

    await db
      .delete(statusPageMonitor)
      .where(
        and(
          eq(statusPageMonitor.statusPageId, Number(pageId)),
          eq(statusPageMonitor.monitorId, Number(monitorId)),
        ),
      );

    return c.body(null, 204);
  });
}
