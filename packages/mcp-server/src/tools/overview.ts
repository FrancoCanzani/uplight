import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UplightApiClient } from "../api-client.js";

export function registerOverviewTools(server: McpServer, api: UplightApiClient) {
  const defaultTeamId = api.getDefaultTeamId();

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
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
    },
    async ({ teamId }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
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
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
    },
    async ({ teamId }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
      }
      try {
        const data = await api.listIntegrations(tid);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "list_maintenance_windows",
    "List maintenance windows for a specific monitor",
    {
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
      monitorId: z.string().describe("Monitor ID"),
    },
    async ({ teamId, monitorId }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
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
