import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { statusPage } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId/:pageId",
  tags: ["status-pages"],
  summary: "Delete a status page",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Status page deleted successfully",
    },
  },
});

export function registerDeleteStatusPage(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { pageId } = c.req.valid("param");

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

    await db.delete(statusPage).where(eq(statusPage.id, Number(pageId)));

    return c.body(null, 204);
  });
}
