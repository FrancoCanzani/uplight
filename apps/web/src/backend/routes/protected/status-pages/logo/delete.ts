import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { statusPage } from "../../../../db/schema";
import { deleteLogo } from "../../../../lib/r2";
import type { AppEnv } from "../../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId/:pageId/logo",
  tags: ["status-pages"],
  summary: "Delete the logo for a status page",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Logo deleted successfully",
    },
  },
});

export function registerDeleteLogo(api: OpenAPIHono<AppEnv>) {
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

    if (!page.logoKey) {
      throw new HTTPException(404, { message: "No logo to delete" });
    }

    await deleteLogo(c.env.status_page_logos, page.logoKey);

    await db
      .update(statusPage)
      .set({ logoKey: null })
      .where(eq(statusPage.id, Number(pageId)));

    return c.body(null, 204);
  });
}
