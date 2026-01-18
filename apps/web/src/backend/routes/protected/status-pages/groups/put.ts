import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { statusPage, statusPageGroup } from "../../../../db/schema";
import type { AppEnv } from "../../../../types";
import { GroupResponseSchema, UpdateGroupSchema } from "../schemas";

const route = createRoute({
  method: "put",
  path: "/:teamId/:pageId/groups/:groupId",
  tags: ["status-pages"],
  summary: "Update a group",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
      groupId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateGroupSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GroupResponseSchema,
        },
      },
      description: "Group updated successfully",
    },
  },
});

export function registerPutGroup(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { pageId, groupId } = c.req.valid("param");
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

    const [updated] = await db
      .update(statusPageGroup)
      .set({
        label: data.label ?? group.label,
        displayOrder: data.displayOrder ?? group.displayOrder,
      })
      .where(eq(statusPageGroup.id, Number(groupId)))
      .returning();

    return c.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  });
}
