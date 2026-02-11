import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UplightApiClient } from "../api-client.js";

export function registerMonitorTools(server: McpServer, api: UplightApiClient) {
  const defaultTeamId = api.getDefaultTeamId();

  server.tool(
    "list_monitors",
    "List all monitors for a team with their current status and recent checks",
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
        const data = await api.listMonitors(tid);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_monitor",
    "Get full details for a specific monitor including domain check info",
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
        const data = await api.getMonitor(tid, monitorId);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_monitor_stats",
    "Get uptime percentage, average response time, and per-location stats for a monitor",
    {
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
      monitorId: z.string().describe("Monitor ID"),
      days: z
        .number()
        .int()
        .min(1)
        .max(90)
        .optional()
        .describe("Number of days to look back (default: 14, max: 90)"),
    },
    async ({ teamId, monitorId, days }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
      }
      try {
        const data = await api.getMonitorStats(tid, monitorId, days);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_monitor_checks",
    "Get check history for a monitor with pagination and filtering by result or location",
    {
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
      monitorId: z.string().describe("Monitor ID"),
      limit: z.number().int().optional().describe("Number of results (default: 50)"),
      offset: z.number().int().optional().describe("Offset for pagination (default: 0)"),
      days: z.number().int().optional().describe("Days to look back (default: 14)"),
      result: z
        .enum(["success", "failure", "timeout", "error", "maintenance", "degraded"])
        .optional()
        .describe("Filter by check result"),
      location: z.string().optional().describe("Filter by monitoring location"),
    },
    async ({ teamId, monitorId, ...params }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
      }
      try {
        const data = await api.getMonitorChecks(tid, monitorId, params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );
}
