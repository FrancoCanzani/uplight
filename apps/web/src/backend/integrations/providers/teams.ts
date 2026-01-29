import { z } from "@hono/zod-openapi";
import { formatDuration } from "../../lib/utils";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const TeamsConfigSchema = z
  .object({
    webhookUrl: z.url(),
  })
  .openapi("TeamsConfig");

export type TeamsConfig = z.infer<typeof TeamsConfigSchema>;

async function sendTeamsWithRetry(
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
        throw new Error(`Teams webhook failed: ${response.status} - ${errorText}`);
      }
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Teams delivery attempt ${attempt}/${retries} failed:`,
        lastError.message
      );

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }
  }

  console.error(`Teams delivery failed after ${retries} attempts`);
  throw lastError;
}

export const teamsProvider: IntegrationProvider<TeamsConfig> = {
  type: "teams",
  configSchema: TeamsConfigSchema,

  async send(config: TeamsConfig, message: IntegrationMessage, _env: Env) {
    if (message.type === "alert") {
      const payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        themeColor: "d63031",
        summary: message.title,
        sections: [
          {
            activityTitle: message.title,
            facts: [
              { name: "Monitor", value: message.monitorName },
              { name: "Cause", value: message.cause },
              { name: "Locations", value: message.locations.join(", ") },
              ...(message.severity
                ? [{ name: "Severity", value: message.severity.toUpperCase() }]
                : []),
              ...(message.errorMessage
                ? [{ name: "Error", value: message.errorMessage }]
                : []),
              ...(message.hint
                ? [{ name: "Hint", value: message.hint }]
                : []),
            ],
            markdown: true,
          },
        ],
      };

      await sendTeamsWithRetry(config.webhookUrl, payload);
    }

    if (message.type === "recovery") {
      const payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        themeColor: "00b894",
        summary: `${message.monitorName} is back UP`,
        sections: [
          {
            activityTitle: `${message.monitorName} is back UP`,
            facts: [
              { name: "Cause", value: message.cause },
              { name: "Downtime", value: formatDuration(message.duration ?? 0) },
              { name: "Monitor ID", value: String(message.monitorId) },
              { name: "Incident ID", value: String(message.incidentId) },
            ],
            markdown: true,
          },
        ],
      };

      await sendTeamsWithRetry(config.webhookUrl, payload);
    }
  },
};
