import { z } from "@hono/zod-openapi";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const GitHubConfigSchema = z
  .object({
    repository: z.string().regex(/^[\w\-.]+\/[\w\-.]+$/),
    token: z.string().min(1),
    labels: z.array(z.string()).optional(),
    assignees: z.array(z.string()).optional(),
  })
  .openapi("GitHubConfig");

export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;

export const githubProvider: IntegrationProvider<GitHubConfig> = {
  type: "github",
  configSchema: GitHubConfigSchema,

  async send(config: GitHubConfig, message: IntegrationMessage, _env: Env) {
    // GitHub integration only creates issues on alerts, not recoveries
    if (message.type !== "alert") {
      return;
    }

    const repoParts = config.repository.split("/");
    if (repoParts.length !== 2) {
      throw new Error(`Invalid repository format: ${config.repository}`);
    }
    const [owner, repo] = repoParts;

    let body = "";
    if (message.description) {
      body += `${message.description}\n\n`;
    }

    body += "**Incident Details:**\n";
    body += `- Incident ID: ${message.incidentId}\n`;
    if (message.severity) {
      body += `- Severity: ${message.severity.toUpperCase()}\n`;
    }
    body += `- Cause: ${message.cause}\n`;
    body += `- Monitor ID: ${message.monitorId}\n`;
    body += `- Affected Locations: ${message.locations.join(", ")}\n`;
    if (message.errorMessage) {
      body += `- Error: ${message.errorMessage}\n`;
    }
    if (message.hint) {
      body += `\n**Hint:** ${message.hint}\n`;
    }
    body += "\n---\n";
    body +=
      "This issue was automatically created by Uplight monitoring system.";

    const labels = ["incident", "monitoring"];
    if (message.severity) {
      labels.push(`severity:${message.severity}`);
    }
    labels.push(...(config.labels || []));

    const payload: Record<string, unknown> = {
      title: message.title,
      body,
      labels,
    };

    if (config.assignees && config.assignees.length > 0) {
      payload.assignees = config.assignees;
    }

    await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
};
