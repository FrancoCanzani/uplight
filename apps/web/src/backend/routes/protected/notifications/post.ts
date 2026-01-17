import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { notifier } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import {
  CreateNotifierSchema,
  DiscordConfigSchema,
  EmailConfigSchema,
  GitHubConfigSchema,
  NotifierResponseSchema,
  SlackConfigSchema,
  WebhookConfigSchema,
} from "./schemas";

const route = createRoute({
  method: "post",
  path: "/:teamId",
  tags: ["notifications"],
  summary: "Create a new notifier",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateNotifierSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: NotifierResponseSchema,
        },
      },
      description: "Notifier created",
    },
  },
});

export function registerPostNotifier(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { teamId } = c.req.param();

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
          eq(notifier.teamId, teamContext.teamId),
          eq(notifier.type, data.type),
        ),
      )
      .limit(1);

    if (existing[0]) {
      throw new HTTPException(400, {
        message: `Notifier of type ${data.type} already exists`,
      });
    }

    const [result] = await db
      .insert(notifier)
      .values({
        teamId: teamContext.teamId,
        type: data.type,
        enabled: data.enabled ?? false,
        config: JSON.stringify(data.config),
      })
      .returning();

    if (!result) {
      throw new HTTPException(500, { message: "Failed to create notifier" });
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
          201,
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
          201,
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
          201,
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
          201,
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
          201,
        );
      }
      default:
        throw new HTTPException(500, {
          message: `Unknown notifier type: ${result.type satisfies never}`,
        });
    }
  });
}
