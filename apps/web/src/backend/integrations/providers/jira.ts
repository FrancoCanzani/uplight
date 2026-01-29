import { z } from "@hono/zod-openapi";
import { formatDuration } from "../../lib/utils";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const JiraConfigSchema = z
  .object({
    domain: z.string().min(1),
    email: z.string().email(),
    apiToken: z.string().min(1),
    projectKey: z.string().min(1),
    issueType: z.string().default("Bug"),
  })
  .openapi("JiraConfig");

export type JiraConfig = z.infer<typeof JiraConfigSchema>;

async function sendJiraWithRetry(
  url: string,
  auth: string,
  payload: unknown,
  retries = 3
): Promise<unknown> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Jira API failed: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Jira delivery attempt ${attempt}/${retries} failed:`,
        lastError.message
      );

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }
  }

  console.error(`Jira delivery failed after ${retries} attempts`);
  throw lastError;
}

export const jiraProvider: IntegrationProvider<JiraConfig> = {
  type: "jira",
  configSchema: JiraConfigSchema,

  async send(config: JiraConfig, message: IntegrationMessage, _env: Env) {
    const auth = btoa(`${config.email}:${config.apiToken}`);
    const baseUrl = `https://${config.domain}.atlassian.net/rest/api/3`;

    if (message.type === "alert") {
      let description = `*Monitor:* ${message.monitorName}\n\n`;
      description += `*Cause:* ${message.cause}\n`;
      description += `*Locations:* ${message.locations.join(", ")}\n`;
      if (message.severity) {
        description += `*Severity:* ${message.severity.toUpperCase()}\n`;
      }
      if (message.errorMessage) {
        description += `*Error:* ${message.errorMessage}\n`;
      }
      if (message.hint) {
        description += `*Hint:* ${message.hint}\n`;
      }
      description += `\n----\nMonitor ID: ${message.monitorId} | Incident ID: ${message.incidentId}`;

      const payload = {
        fields: {
          project: {
            key: config.projectKey,
          },
          summary: message.title,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: description,
                  },
                ],
              },
            ],
          },
          issuetype: {
            name: config.issueType,
          },
          labels: ["uplight", "incident"],
        },
      };

      await sendJiraWithRetry(`${baseUrl}/issue`, auth, payload);
    }

    if (message.type === "recovery") {
      const description = `*Monitor:* ${message.monitorName}\n\n*Cause:* ${message.cause}\n*Downtime:* ${formatDuration(message.duration ?? 0)}\n\n----\nMonitor ID: ${message.monitorId} | Incident ID: ${message.incidentId}`;

      const payload = {
        fields: {
          project: {
            key: config.projectKey,
          },
          summary: `[Recovered] ${message.monitorName} is back UP`,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: description,
                  },
                ],
              },
            ],
          },
          issuetype: {
            name: config.issueType,
          },
          labels: ["uplight", "recovery"],
        },
      };

      await sendJiraWithRetry(`${baseUrl}/issue`, auth, payload);
    }
  },
};
