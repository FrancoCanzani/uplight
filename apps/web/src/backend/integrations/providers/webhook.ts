import { z } from "@hono/zod-openapi";
import { formatDuration } from "../../lib/utils";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const WebhookConfigSchema = z
  .object({
    url: z.url(),
    method: z.enum(["POST", "PUT", "PATCH"]).default("POST"),
  })
  .openapi("WebhookConfig");

export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;

export const webhookProvider: IntegrationProvider<WebhookConfig> = {
  type: "webhook",
  configSchema: WebhookConfigSchema,

  async send(config: WebhookConfig, message: IntegrationMessage, _env: Env) {
    if (message.type === "alert") {
      const payload = {
        event: "incident.created",
        monitor: {
          id: message.monitorId,
          name: message.monitorName,
        },
        incident: {
          id: message.incidentId,
          title: message.title,
          description: message.description,
          hint: message.hint,
          severity: message.severity,
          cause: message.cause,
        },
        locations: message.locations,
        error: message.errorMessage,
        timestamp: message.timestamp,
      };

      await fetch(config.url, {
        method: config.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (message.type === "recovery") {
      const payload = {
        event: "incident.resolved",
        monitor: {
          id: message.monitorId,
          name: message.monitorName,
        },
        incident: {
          id: message.incidentId,
          cause: message.cause,
          duration: message.duration,
        },
        downtime: formatDuration(message.duration ?? 0),
        timestamp: message.timestamp,
      };

      await fetch(config.url, {
        method: config.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  },
};
