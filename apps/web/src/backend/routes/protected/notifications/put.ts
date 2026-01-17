import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { notifier } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import {
  DiscordConfigSchema,
  EmailConfigSchema,
  GitHubConfigSchema,
  NotifierResponseSchema,
  SlackConfigSchema,
  UpdateNotifierSchema,
  WebhookConfigSchema,
} from "./schemas";

const route = createRoute({
  method: "put",
  path: "/:teamId/:notifierId",
  tags: ["notifications"],
  summary: "Update a notifier",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateNotifierSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NotifierResponseSchema,
        },
      },
      description: "Notifier updated",
    },
  },
});

export function registerPutNotifier(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { teamId, notifierId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    if (teamContext.teamId !== Number(teamId)) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const existing = await db
      .select()
      .from(notifier)
      .where(
        and(
          eq(notifier.id, Number(notifierId)),
          eq(notifier.teamId, teamContext.teamId),
        ),
      )
      .limit(1);

    if (!existing[0]) {
      throw new HTTPException(404, { message: "Notifier not found" });
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.enabled !== undefined) updates.enabled = data.enabled;
    if (data.config !== undefined) updates.config = JSON.stringify(data.config);

    const [result] = await db
      .update(notifier)
      .set(updates)
      .where(eq(notifier.id, Number(notifierId)))
      .returning();

    if (!result) {
      throw new HTTPException(500, { message: "Failed to update notifier" });
    }

    let parsedConfig: unknown;
    try {
      parsedConfig = JSON.parse(result.config);
    } catch {
      throw new HTTPException(500, {
        message: `Invalid config for notifier ${result.id}`,
      });
    }

    switch (result.type) {
      case "email": {
        const validatedConfig = EmailConfigSchema.parse(parsedConfig);
        return c.json(
          {
            id: result.id,
            teamId: result.teamId,
            type: "email" as const,
            enabled: result.enabled,
            config: validatedConfig,
            createdAt: result.createdAt.getTime(),
            updatedAt: result.updatedAt.getTime(),
          },
          200,
        );
      }
      case "slack": {
        const validatedConfig = SlackConfigSchema.parse(parsedConfig);
        return c.json(
          {
            id: result.id,
            teamId: result.teamId,
            type: "slack" as const,
            enabled: result.enabled,
            config: validatedConfig,
            createdAt: result.createdAt.getTime(),
            updatedAt: result.updatedAt.getTime(),
          },
          200,
        );
      }
      case "discord": {
        const validatedConfig = DiscordConfigSchema.parse(parsedConfig);
        return c.json(
          {
            id: result.id,
            teamId: result.teamId,
            type: "discord" as const,
            enabled: result.enabled,
            config: validatedConfig,
            createdAt: result.createdAt.getTime(),
            updatedAt: result.updatedAt.getTime(),
          },
          200,
        );
      }
      case "webhook": {
        const validatedConfig = WebhookConfigSchema.parse(parsedConfig);
        return c.json(
          {
            id: result.id,
            teamId: result.teamId,
            type: "webhook" as const,
            enabled: result.enabled,
            config: validatedConfig,
            createdAt: result.createdAt.getTime(),
            updatedAt: result.updatedAt.getTime(),
          },
          200,
        );
      }
      case "github": {
        const validatedConfig = GitHubConfigSchema.parse(parsedConfig);
        return c.json(
          {
            id: result.id,
            teamId: result.teamId,
            type: "github" as const,
            enabled: result.enabled,
            config: validatedConfig,
            createdAt: result.createdAt.getTime(),
            updatedAt: result.updatedAt.getTime(),
          },
          200,
        );
      }
      default:
        throw new HTTPException(500, {
          message: `Unknown notifier type: ${result.type satisfies never}`,
        });
    }
  });
}
