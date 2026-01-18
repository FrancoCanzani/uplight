import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { statusPage } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { StatusPageResponseSchema } from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId",
  tags: ["status-pages"],
  summary: "Get all status pages for a team",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(StatusPageResponseSchema),
        },
      },
      description: "List of status pages",
    },
  },
});

export function registerGetAllStatusPages(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const pages = await db
      .select()
      .from(statusPage)
      .where(eq(statusPage.teamId, teamContext.teamId));

    return c.json(
      pages.map((page) => ({
        ...page,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      })),
    );
  });
}
