import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { statusPage } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { StatusPageResponseSchema } from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId/:pageId",
  tags: ["status-pages"],
  summary: "Get a single status page",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: StatusPageResponseSchema,
        },
      },
      description: "Status page details",
    },
  },
});

export function registerGetStatusPage(api: OpenAPIHono<AppEnv>) {
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

    return c.json({
      ...page,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    });
  });
}
