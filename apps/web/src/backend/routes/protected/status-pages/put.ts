import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { statusPage } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { StatusPageResponseSchema, UpdateStatusPageSchema } from "./schemas";

const route = createRoute({
  method: "put",
  path: "/:teamId/:pageId",
  tags: ["status-pages"],
  summary: "Update a status page",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateStatusPageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: StatusPageResponseSchema,
        },
      },
      description: "Status page updated successfully",
    },
  },
});

export function registerPutStatusPage(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { pageId } = c.req.valid("param");
    const data = c.req.valid("json");

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

    const [updated] = await db
      .update(statusPage)
      .set({
        name: data.name ?? page.name,
        description: data.description !== undefined ? data.description : page.description,
        isPublic: data.isPublic ?? page.isPublic,
        showHistoricalUptime: data.showHistoricalUptime ?? page.showHistoricalUptime,
      })
      .where(eq(statusPage.id, Number(pageId)))
      .returning();

    return c.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  });
}
