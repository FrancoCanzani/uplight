import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UplightApiClient } from "../api-client.js";

const REDACTED_VALUE = "[REDACTED]";
const SENSITIVE_KEY_PATTERN =
  /(token|secret|password|api[-_]?key|auth|webhook[-_]?url|routing[-_]?key)/i;

function redactSensitiveData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item));
  }

  if (value && typeof value === "object") {
    const redacted: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      redacted[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? REDACTED_VALUE
        : redactSensitiveData(nestedValue);
    }
    return redacted;
  }

  return value;
}

export function registerOverviewTools(server: McpServer, api: UplightApiClient) {
  const defaultTeamId = api.getDefaultTeamId();
  const teamIdSchema = defaultTeamId
    ? z.string().regex(/^\d+$/).optional().describe(`Team ID (default: ${defaultTeamId})`)
    : z.string().regex(/^\d+$/).describe("Team ID");

  server.tool(
    "list_teams",
    "List all teams the authenticated user belongs to",
    {},
    async () => {
      try {
        const data = await api.listTeams();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "list_status_pages",
    "List all public status pages for a team",
    {
      teamId: teamIdSchema,
    },
    async ({ teamId }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return {
          content: [{ type: "text", text: "Error: teamId is required" }],
          isError: true,
        };
      }
      try {
        const data = await api.listStatusPages(tid);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "list_integrations",
    "List all alert integrations (Slack, Discord, email, webhooks) for a team",
    {
      teamId: teamIdSchema,
    },
    async ({ teamId }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return {
          content: [{ type: "text", text: "Error: teamId is required" }],
          isError: true,
        };
      }
      try {
        const data = await api.listIntegrations(tid);
        const redactedData = redactSensitiveData(data);
        return { content: [{ type: "text", text: JSON.stringify(redactedData, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "list_maintenance_windows",
    "List maintenance windows for a specific monitor",
    {
      teamId: teamIdSchema,
      monitorId: z.string().regex(/^\d+$/).describe("Monitor ID"),
    },
    async ({ teamId, monitorId }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return {
          content: [{ type: "text", text: "Error: teamId is required" }],
          isError: true,
        };
      }
      try {
        const data = await api.listMaintenanceWindows(tid, monitorId);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );
}
