import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { statusPage, statusPageGroup } from "../../../../db/schema";
import type { AppEnv } from "../../../../types";
import { CreateGroupSchema, GroupResponseSchema } from "../schemas";

const route = createRoute({
  method: "post",
  path: "/:teamId/:pageId/groups",
  tags: ["status-pages"],
  summary: "Create a new group for a status page",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: CreateGroupSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: GroupResponseSchema,
        },
      },
      description: "Group created successfully",
    },
  },
});

export function registerPostGroup(api: OpenAPIHono<AppEnv>) {
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

    const [created] = await db
      .insert(statusPageGroup)
      .values({
        statusPageId: Number(pageId),
        label: data.label,
        displayOrder: data.displayOrder,
      })
      .returning();

    return c.json(
      {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      201,
    );
  });
}
