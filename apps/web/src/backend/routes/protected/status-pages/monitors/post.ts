import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import {
    monitor,
    statusPage,
    statusPageGroup,
    statusPageMonitor,
} from "../../../../db/schema";
import type { AppEnv } from "../../../../types";
import { AddMonitorSchema, StatusPageMonitorResponseSchema } from "../schemas";

const route = createRoute({
  method: "post",
  path: "/:teamId/:pageId/monitors",
  tags: ["status-pages"],
  summary: "Add a monitor to a status page",
  request: {
    params: z.object({
      teamId: z.string(),
      pageId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: AddMonitorSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: StatusPageMonitorResponseSchema,
        },
      },
      description: "Monitor added successfully",
    },
  },
});

export function registerPostMonitor(api: OpenAPIHono<AppEnv>) {
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

    const [monitorExists] = await db
      .select()
      .from(monitor)
      .where(
        and(
          eq(monitor.id, data.monitorId),
          eq(monitor.teamId, teamContext.teamId),
        ),
      )
      .limit(1);

    if (!monitorExists) {
      throw new HTTPException(404, { message: "Monitor not found" });
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

    const [created] = await db
      .insert(statusPageMonitor)
      .values({
        statusPageId: Number(pageId),
        monitorId: data.monitorId,
        groupId: data.groupId ?? null,
        displayOrder: data.displayOrder,
        displayName: data.displayName ?? null,
      })
      .returning();

    return c.json(
      {
        ...created,
        createdAt: created.createdAt.toISOString(),
      },
      201,
    );
  });
}
