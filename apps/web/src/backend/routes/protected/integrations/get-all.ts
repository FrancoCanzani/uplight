import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { integration } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import {
  DiscordConfigSchema,
  EmailConfigSchema,
  GitHubConfigSchema,
  IntegrationResponseSchema,
  SlackConfigSchema,
  WebhookConfigSchema,
} from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId",
  tags: ["integrations"],
  summary: "List all integrations",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(IntegrationResponseSchema),
        },
      },
      description: "List of integrations",
    },
  },
});

export function registerGetAllIntegrations(api: OpenAPIHono<AppEnv>) {
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
      .from(integration)
      .where(eq(integration.teamId, teamContext.teamId));

    const integrations = results.map((n) => {
      let parsedConfig: unknown;
      try {
        parsedConfig = JSON.parse(n.config);
      } catch {
        throw new HTTPException(500, {
          message: `Invalid config for integration ${n.id}`,
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
            message: `Unknown integration type: ${n.type satisfies never}`,
          });
      }
    });

    return c.json(integrations, 200);
  });
}
