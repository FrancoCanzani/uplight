import { z } from "@hono/zod-openapi";
import { formatDuration } from "../../lib/utils";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const SlackConfigSchema = z
  .object({
    webhookUrl: z.url(),
    channel: z.string().optional(),
    username: z.string().optional(),
  })
  .openapi("SlackConfig");

export type SlackConfig = z.infer<typeof SlackConfigSchema>;

async function sendSlackWithRetry(
  webhookUrl: string,
  payload: unknown,
  retries = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Slack webhook failed: ${response.status} - ${errorText}`);
      }
      return; // Success
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Slack delivery attempt ${attempt}/${retries} failed:`,
        lastError.message
      );

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }
  }

  console.error(`Slack delivery failed after ${retries} attempts`);
  throw lastError;
}

export const slackProvider: IntegrationProvider<SlackConfig> = {
  type: "slack",
  configSchema: SlackConfigSchema,

  async send(config: SlackConfig, message: IntegrationMessage, _env: Env) {
    if (message.type === "alert") {
      let text = `*${message.title}*\n\n`;
      if (message.description) {
        text += `${message.description}\n\n`;
      }
      if (message.severity) {
        text += `*Severity:* ${message.severity.toUpperCase()}\n`;
      }
      text += `*Cause:* ${message.cause}\n`;
      text += `*Locations:* ${message.locations.join(", ")}\n`;
      if (message.errorMessage) {
        text += `*Error:* ${message.errorMessage}\n`;
      }
      if (message.hint) {
        text += `\n*Hint:* ${message.hint}\n`;
      }
      text += `*Monitor ID:* ${message.monitorId}\n`;
      text += `*Incident ID:* ${message.incidentId}`;

      const payload = {
        text: `[Alert] ${message.title}`,
        channel: config.channel,
        username: config.username,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text,
            },
          },
        ],
      };

      await sendSlackWithRetry(config.webhookUrl, payload);
    }

    if (message.type === "recovery") {
      const text = `*${message.monitorName}* is back UP\n\n*Cause:* ${message.cause}\n*Downtime:* ${formatDuration(message.duration ?? 0)}\n*Monitor ID:* ${message.monitorId}\n*Incident ID:* ${message.incidentId}`;

      const payload = {
        text: `[Recovered] *${message.monitorName}* is back UP`,
        channel: config.channel,
        username: config.username,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text,
            },
          },
        ],
      };

      await sendSlackWithRetry(config.webhookUrl, payload);
    }
  },
};
