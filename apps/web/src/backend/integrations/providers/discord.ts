import { z } from "@hono/zod-openapi";
import { formatDuration } from "../../lib/utils";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const DiscordConfigSchema = z
  .object({
    webhookUrl: z.url(),
    username: z.string().optional(),
    avatarUrl: z.union([z.url(), z.literal("")]).optional(),
  })
  .openapi("DiscordConfig");

export type DiscordConfig = z.infer<typeof DiscordConfigSchema>;

async function sendDiscordWithRetry(
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

      // Discord returns 204 on success
      if (!response.ok && response.status !== 204) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`);
      }
      return; // Success
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Discord delivery attempt ${attempt}/${retries} failed:`,
        lastError.message
      );

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }
  }

  console.error(`Discord delivery failed after ${retries} attempts`);
  throw lastError;
}

export const discordProvider: IntegrationProvider<DiscordConfig> = {
  type: "discord",
  configSchema: DiscordConfigSchema,

  async send(config: DiscordConfig, message: IntegrationMessage, _env: Env) {
    if (message.type === "alert") {
      const fields: Array<{
        name: string;
        value: string;
        inline: boolean;
      }> = [];

      if (message.severity) {
        fields.push({
          name: "Severity",
          value: message.severity.toUpperCase(),
          inline: true,
        });
      }
      fields.push({ name: "Cause", value: message.cause, inline: true });
      fields.push({
        name: "Locations",
        value: message.locations.join(", ") || "N/A",
        inline: true,
      });
      fields.push({
        name: "Monitor ID",
        value: String(message.monitorId),
        inline: true,
      });
      fields.push({
        name: "Incident ID",
        value: String(message.incidentId),
        inline: true,
      });
      if (message.errorMessage) {
        fields.push({ name: "Error", value: message.errorMessage, inline: false });
      }
      if (message.hint) {
        fields.push({
          name: "Hint",
          value: message.hint,
          inline: false,
        });
      }

      const payload: Record<string, unknown> = {
        content: `**${message.title}**`,
        embeds: [
          {
            title: message.title,
            description: message.description,
            color: 15158332, // Red
            fields,
            timestamp: message.timestamp,
          },
        ],
      };

      if (config.username) payload.username = config.username;
      if (config.avatarUrl && config.avatarUrl !== "") {
        payload.avatar_url = config.avatarUrl;
      }

      await sendDiscordWithRetry(config.webhookUrl, payload);
    }

    if (message.type === "recovery") {
      const payload: Record<string, unknown> = {
        content: `**${message.monitorName}** is back UP`,
        embeds: [
          {
            title: "Monitor Recovered",
            description: `Monitor "${message.monitorName}" has recovered.`,
            color: 3066993, // Green
            fields: [
              { name: "Cause", value: message.cause, inline: true },
              {
                name: "Downtime",
                value: formatDuration(message.duration ?? 0),
                inline: true,
              },
              {
                name: "Monitor ID",
                value: String(message.monitorId),
                inline: true,
              },
              {
                name: "Incident ID",
                value: String(message.incidentId),
                inline: true,
              },
            ],
            timestamp: message.timestamp,
          },
        ],
      };

      if (config.username) payload.username = config.username;
      if (config.avatarUrl && config.avatarUrl !== "") {
        payload.avatar_url = config.avatarUrl;
      }

      await sendDiscordWithRetry(config.webhookUrl, payload);
    }
  },
};
