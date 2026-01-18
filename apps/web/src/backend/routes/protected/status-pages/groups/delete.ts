import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { statusPage, statusPageGroup } from "../../../../db/schema";
import type { AppEnv } from "../../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId/:pageId/groups/:groupId",
  tags: ["status-pages"],
  summary: "Delete a group",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
      groupId: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Group deleted successfully",
    },
  },
});

export function registerDeleteGroup(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { pageId, groupId } = c.req.valid("param");

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

    const [group] = await db
      .select()
      .from(statusPageGroup)
      .where(
        and(
          eq(statusPageGroup.id, Number(groupId)),
          eq(statusPageGroup.statusPageId, Number(pageId)),
        ),
      )
      .limit(1);

    if (!group) {
      throw new HTTPException(404, { message: "Group not found" });
    }

    await db.delete(statusPageGroup).where(eq(statusPageGroup.id, Number(groupId)));

    return c.body(null, 204);
  });
}
