import { z } from "@hono/zod-openapi";
import { formatDuration } from "../../lib/utils";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const LinearConfigSchema = z
  .object({
    apiKey: z.string().min(1),
    teamId: z.string().min(1),
    labelIds: z.array(z.string()).optional(),
  })
  .openapi("LinearConfig");

export type LinearConfig = z.infer<typeof LinearConfigSchema>;

async function linearGraphQL(
  apiKey: string,
  query: string,
  variables: Record<string, unknown>,
  retries = 3
): Promise<unknown> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Linear API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.errors) {
        throw new Error(`Linear GraphQL error: ${JSON.stringify(data.errors)}`);
      }

      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Linear delivery attempt ${attempt}/${retries} failed:`,
        lastError.message
      );

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }
  }

  console.error(`Linear delivery failed after ${retries} attempts`);
  throw lastError;
}

export const linearProvider: IntegrationProvider<LinearConfig> = {
  type: "linear",
  configSchema: LinearConfigSchema,

  async send(config: LinearConfig, message: IntegrationMessage, _env: Env) {
    if (message.type === "alert") {
      let description = `**Monitor:** ${message.monitorName}\n\n`;
      description += `**Cause:** ${message.cause}\n`;
      description += `**Locations:** ${message.locations.join(", ")}\n`;
      if (message.severity) {
        description += `**Severity:** ${message.severity.toUpperCase()}\n`;
      }
      if (message.errorMessage) {
        description += `**Error:** ${message.errorMessage}\n`;
      }
      if (message.hint) {
        description += `**Hint:** ${message.hint}\n`;
      }
      description += `\n---\nMonitor ID: ${message.monitorId} | Incident ID: ${message.incidentId}`;

      const query = `
        mutation CreateIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              identifier
            }
          }
        }
      `;

      const variables = {
        input: {
          teamId: config.teamId,
          title: message.title,
          description,
          ...(config.labelIds && config.labelIds.length > 0
            ? { labelIds: config.labelIds }
            : {}),
        },
      };

      await linearGraphQL(config.apiKey, query, variables);
    }

    if (message.type === "recovery") {
      const query = `
        mutation CreateIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              identifier
            }
          }
        }
      `;

      const description = `**Monitor:** ${message.monitorName}\n\n**Cause:** ${message.cause}\n**Downtime:** ${formatDuration(message.duration ?? 0)}\n\n---\nMonitor ID: ${message.monitorId} | Incident ID: ${message.incidentId}`;

      const variables = {
        input: {
          teamId: config.teamId,
          title: `[Recovered] ${message.monitorName} is back UP`,
          description,
          ...(config.labelIds && config.labelIds.length > 0
            ? { labelIds: config.labelIds }
            : {}),
        },
      };

      await linearGraphQL(config.apiKey, query, variables);
    }
  },
};
