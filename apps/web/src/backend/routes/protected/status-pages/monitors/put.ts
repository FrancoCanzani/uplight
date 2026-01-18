import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import {
    statusPage,
    statusPageGroup,
    statusPageMonitor,
} from "../../../../db/schema";
import type { AppEnv } from "../../../../types";
import {
    StatusPageMonitorResponseSchema,
    UpdateMonitorSchema,
} from "../schemas";

const route = createRoute({
  method: "put",
  path: "/:teamId/:pageId/monitors/:monitorId",
  tags: ["status-pages"],
  summary: "Update monitor settings on a status page",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
      monitorId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateMonitorSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: StatusPageMonitorResponseSchema,
        },
      },
      description: "Monitor updated successfully",
    },
  },
});

export function registerPutMonitor(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { pageId, monitorId } = c.req.valid("param");
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

    const [existing] = await db
      .select()
      .from(statusPageMonitor)
      .where(
        and(
          eq(statusPageMonitor.statusPageId, Number(pageId)),
          eq(statusPageMonitor.monitorId, Number(monitorId)),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HTTPException(404, { message: "Monitor not on this status page" });
    }

    if (data.groupId !== null && data.groupId !== undefined) {
      const [groupExists] = await db
        .select()
        .from(statusPageGroup)
        .where(
          and(
            eq(statusPageGroup.id, data.groupId),
            eq(statusPageGroup.statusPageId, Number(pageId)),
          ),
        )
        .limit(1);

      if (!groupExists) {
        throw new HTTPException(404, { message: "Group not found" });
      }
    }

    const [updated] = await db
      .update(statusPageMonitor)
      .set({
        groupId: data.groupId !== undefined ? data.groupId : existing.groupId,
        displayOrder: data.displayOrder ?? existing.displayOrder,
        displayName: data.displayName !== undefined ? data.displayName : existing.displayName,
      })
      .where(
        and(
          eq(statusPageMonitor.statusPageId, Number(pageId)),
          eq(statusPageMonitor.monitorId, Number(monitorId)),
        ),
      )
      .returning();

    return c.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    });
  });
}
