import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UplightApiClient } from "../api-client.js";

export function registerHeartbeatTools(server: McpServer, api: UplightApiClient) {
  const defaultTeamId = api.getDefaultTeamId();

  server.tool(
    "list_heartbeats",
    "List all heartbeat monitors for a team with recent pings and incident count",
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
        const data = await api.listHeartbeats(tid);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_heartbeat",
    "Get full details for a specific heartbeat monitor including recent pings",
    {
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
      heartbeatId: z.string().describe("Heartbeat ID"),
    },
    async ({ teamId, heartbeatId }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
      }
      try {
        const data = await api.getHeartbeat(tid, heartbeatId);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );
}
