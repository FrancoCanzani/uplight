import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { notifier } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import {
  NotifierResponseSchema,
  EmailConfigSchema,
  SlackConfigSchema,
  DiscordConfigSchema,
  WebhookConfigSchema,
  GitHubConfigSchema,
} from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId",
  tags: ["notifications"],
  summary: "List all notifiers",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(NotifierResponseSchema),
        },
      },
      description: "List of notifiers",
    },
  },
});

export function registerGetAllNotifiers(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { teamId } = c.req.param();

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    if (teamContext.teamId !== Number(teamId)) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    const db = createDb(c.env.DB);

    const results = await db
      .select()
      .from(notifier)
      .where(eq(notifier.teamId, teamContext.teamId));

    const notifiers = results.map((n) => {
      let parsedConfig: unknown;
      try {
        parsedConfig = JSON.parse(n.config);
      } catch {
        throw new HTTPException(500, {
          message: `Invalid config for notifier ${n.id}`,
        });
      }

      switch (n.type) {
        case "email": {
          const validatedConfig = EmailConfigSchema.parse(parsedConfig);
          return {
            id: n.id,
            teamId: n.teamId,
            type: "email" as const,
            enabled: n.enabled,
            config: validatedConfig,
            createdAt: n.createdAt.getTime(),
            updatedAt: n.updatedAt.getTime(),
          };
        }
        case "slack": {
          const validatedConfig = SlackConfigSchema.parse(parsedConfig);
          return {
            id: n.id,
            teamId: n.teamId,
            type: "slack" as const,
            enabled: n.enabled,
            config: validatedConfig,
            createdAt: n.createdAt.getTime(),
            updatedAt: n.updatedAt.getTime(),
          };
        }
        case "discord": {
          const validatedConfig = DiscordConfigSchema.parse(parsedConfig);
          return {
            id: n.id,
            teamId: n.teamId,
            type: "discord" as const,
            enabled: n.enabled,
            config: validatedConfig,
            createdAt: n.createdAt.getTime(),
            updatedAt: n.updatedAt.getTime(),
          };
        }
        case "webhook": {
          const validatedConfig = WebhookConfigSchema.parse(parsedConfig);
          return {
            id: n.id,
            teamId: n.teamId,
            type: "webhook" as const,
            enabled: n.enabled,
            config: validatedConfig,
            createdAt: n.createdAt.getTime(),
            updatedAt: n.updatedAt.getTime(),
          };
        }
        case "github": {
          const validatedConfig = GitHubConfigSchema.parse(parsedConfig);
          return {
            id: n.id,
            teamId: n.teamId,
            type: "github" as const,
            enabled: n.enabled,
            config: validatedConfig,
            createdAt: n.createdAt.getTime(),
            updatedAt: n.updatedAt.getTime(),
          };
        }
        default:
          throw new HTTPException(500, {
            message: `Unknown notifier type: ${n.type satisfies never}`,
          });
      }
    });

    return c.json(notifiers, 200);
  });
}
