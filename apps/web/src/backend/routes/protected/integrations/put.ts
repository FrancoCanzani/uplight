import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
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
  UpdateIntegrationSchema,
  WebhookConfigSchema,
} from "./schemas";

const route = createRoute({
  method: "put",
  path: "/:teamId/:integrationId",
  tags: ["integrations"],
  summary: "Update an integration",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateIntegrationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IntegrationResponseSchema,
        },
      },
      description: "Integration updated",
    },
  },
});

export function registerPutIntegration(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { teamId, integrationId } = c.req.param();

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
      .from(integration)
      .where(
        and(
          eq(integration.id, Number(integrationId)),
          eq(integration.teamId, teamContext.teamId),
        ),
      )
      .limit(1);

    if (!existing[0]) {
      throw new HTTPException(404, { message: "Integration not found" });
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.enabled !== undefined) updates.enabled = data.enabled;
    if (data.config !== undefined) updates.config = JSON.stringify(data.config);

    const [result] = await db
      .update(integration)
      .set(updates)
      .where(eq(integration.id, Number(integrationId)))
      .returning();

    if (!result) {
      throw new HTTPException(500, { message: "Failed to update integration" });
    }

    let parsedConfig: unknown;
    try {
      parsedConfig = JSON.parse(result.config);
    } catch {
      throw new HTTPException(500, {
        message: `Invalid config for integration ${result.id}`,
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
          message: `Unknown integration type: ${result.type satisfies never}`,
        });
    }
  });
}
