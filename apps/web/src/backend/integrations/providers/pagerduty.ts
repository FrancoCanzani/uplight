import { z } from "@hono/zod-openapi";
import { formatDuration } from "../../lib/utils";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const PagerDutyConfigSchema = z
  .object({
    routingKey: z.string().min(1),
    severity: z.enum(["critical", "error", "warning", "info"]).default("error"),
  })
  .openapi("PagerDutyConfig");

export type PagerDutyConfig = z.infer<typeof PagerDutyConfigSchema>;

async function sendPagerDutyWithRetry(
  payload: unknown,
  retries = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        "https://events.pagerduty.com/v2/enqueue",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`PagerDuty API failed: ${response.status} - ${errorText}`);
      }
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `PagerDuty delivery attempt ${attempt}/${retries} failed:`,
        lastError.message
      );

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }
  }

  console.error(`PagerDuty delivery failed after ${retries} attempts`);
  throw lastError;
}

export const pagerdutyProvider: IntegrationProvider<PagerDutyConfig> = {
  type: "pagerduty",
  configSchema: PagerDutyConfigSchema,

  async send(config: PagerDutyConfig, message: IntegrationMessage, _env: Env) {
    if (message.type === "alert") {
      const payload = {
        routing_key: config.routingKey,
        event_action: "trigger",
        dedup_key: `uplight-incident-${message.incidentId}`,
        payload: {
          summary: message.title,
          severity: config.severity,
          source: message.monitorName,
          custom_details: {
            description: message.description,
            cause: message.cause,
            locations: message.locations.join(", "),
            error_message: message.errorMessage,
            hint: message.hint,
            monitor_id: message.monitorId,
            incident_id: message.incidentId,
          },
        },
      };

      await sendPagerDutyWithRetry(payload);
    }

    if (message.type === "recovery") {
      const payload = {
        routing_key: config.routingKey,
        event_action: "resolve",
        dedup_key: `uplight-incident-${message.incidentId}`,
        payload: {
          summary: `${message.monitorName} is back UP`,
          severity: "info",
          source: message.monitorName,
          custom_details: {
            cause: message.cause,
            downtime: formatDuration(message.duration ?? 0),
            monitor_id: message.monitorId,
            incident_id: message.incidentId,
          },
        },
      };

      await sendPagerDutyWithRetry(payload);
    }
  },
};
