import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UplightApiClient } from "../api-client.js";

export function registerIncidentTools(server: McpServer, api: UplightApiClient) {
  const defaultTeamId = api.getDefaultTeamId();

  server.tool(
    "list_incidents",
    "List incidents for a team, optionally filtered by monitor or heartbeat",
    {
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
      limit: z.number().int().optional().describe("Number of results (default: 20)"),
      offset: z.number().int().optional().describe("Offset for pagination (default: 0)"),
      monitorId: z.string().optional().describe("Filter by monitor ID"),
      heartbeatId: z.string().optional().describe("Filter by heartbeat ID"),
    },
    async ({ teamId, ...params }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
      }
      try {
        const data = await api.listIncidents(tid, params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_incident",
    "Get full details for a specific incident including status timeline and assignees",
    {
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
      incidentId: z.string().describe("Incident ID"),
    },
    async ({ teamId, incidentId }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
      }
      try {
        const data = await api.getIncident(tid, incidentId);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_incident_activities",
    "Get the activity timeline for an incident (status changes, comments, assignments)",
    {
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
      incidentId: z.string().describe("Incident ID"),
    },
    async ({ teamId, incidentId }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
      }
      try {
        const data = await api.getIncidentActivities(tid, incidentId);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_incident_status",
    "Update the status of an incident (acknowledge, fixing, recovered, resolved)",
    {
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
      incidentId: z.string().describe("Incident ID"),
      status: z
        .enum(["ongoing", "acknowledged", "fixing", "recovered", "resolved"])
        .describe("New status for the incident"),
    },
    async ({ teamId, incidentId, status }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
      }
      try {
        const data = await api.updateIncidentStatus(tid, incidentId, status);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );

  server.tool(
    "add_incident_comment",
    "Add a comment to an incident's activity timeline",
    {
      teamId: defaultTeamId
        ? z.string().optional().describe(`Team ID (default: ${defaultTeamId})`)
        : z.string().describe("Team ID"),
      incidentId: z.string().describe("Incident ID"),
      content: z.string().describe("Comment text to add"),
    },
    async ({ teamId, incidentId, content }) => {
      const tid = teamId ?? defaultTeamId;
      if (!tid) {
        return { content: [{ type: "text", text: "Error: teamId is required" }] };
      }
      try {
        const data = await api.addIncidentComment(tid, incidentId, content);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    },
  );
}
