import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { statusPage } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { CreateStatusPageSchema, StatusPageResponseSchema } from "./schemas";

const route = createRoute({
  method: "post",
  path: "/:teamId",
  tags: ["status-pages"],
  summary: "Create a new status page",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateStatusPageSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: StatusPageResponseSchema,
        },
      },
      description: "Status page created successfully",
    },
  },
});

export function registerPostStatusPage(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const [created] = await db
      .insert(statusPage)
      .values({
        teamId: teamContext.teamId,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        isPublic: data.isPublic,
        showHistoricalUptime: data.showHistoricalUptime,
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
