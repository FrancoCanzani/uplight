import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { heartbeat } from "../../../db/schema";
import { generateHeartbeatSlug } from "../../../lib/utils";
import type { AppEnv } from "../../../types";
import { CreateHeartbeatSchema, HeartbeatResponseSchema } from "./schemas";

const route = createRoute({
  method: "post",
  path: "/:teamId",
  tags: ["heartbeats"],
  summary: "Create a new heartbeat",
  description: "Creates a heartbeat monitor for cron jobs and background tasks",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateHeartbeatSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: HeartbeatResponseSchema,
        },
      },
      description: "Heartbeat created successfully",
    },
  },
});

export function registerPostHeartbeat(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const slug = generateHeartbeatSlug(data.name);

    const [created] = await db
      .insert(heartbeat)
      .values({
        teamId: teamContext.teamId,
        name: data.name,
        slug,
        gracePeriod: data.gracePeriod,
        status: "initializing",
      })
      .returning();

    return c.json(
      {
        id: created.id,
        teamId: created.teamId,
        type: "heartbeat" as const,
        name: created.name,
        slug: created.slug,
        gracePeriod: created.gracePeriod,
        status: created.status,
        lastPingAt: created.lastPingAt?.getTime() ?? null,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        pingUrl: `/api/public/ping/${created.slug}`,
      },
      201
    );
  });
}
