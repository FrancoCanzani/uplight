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

async function sendWebhookWithRetry(
  url: string,
  method: string,
  payload: unknown,
  retries = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }
      return; // Success
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Webhook delivery attempt ${attempt}/${retries} failed:`,
        lastError.message
      );

      if (attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }
  }

  console.error(`Webhook delivery failed after ${retries} attempts:`, url);
  throw lastError;
}

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

      await sendWebhookWithRetry(config.url, config.method, payload);
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

      await sendWebhookWithRetry(config.url, config.method, payload);
    }
  },
};
