import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { createDb } from "../../../db";
import { statusPage } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const route = createRoute({
  method: "get",
  path: "/:teamId/check-slug/:slug",
  tags: ["status-pages"],
  summary: "Check if slug is available",
  request: {
    params: z.object({
      teamId: z.string(),
      slug: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            available: z.boolean(),
          }),
        },
      },
      description: "Slug availability status",
    },
  },
});

export function registerCheckSlug(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const { slug } = c.req.valid("param");
    const db = createDb(c.env.DB);

    const [existing] = await db
      .select()
      .from(statusPage)
      .where(eq(statusPage.slug, slug))
      .limit(1);

    return c.json({
      available: !existing,
    });
  });
}
