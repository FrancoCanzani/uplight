#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { UplightApiClient } from "./api-client.js";
import { registerHeartbeatTools } from "./tools/heartbeats.js";
import { registerIncidentTools } from "./tools/incidents.js";
import { registerMonitorTools } from "./tools/monitors.js";
import { registerOverviewTools } from "./tools/overview.js";

const apiUrl = process.env.UPLIGHT_API_URL;
const sessionToken = process.env.UPLIGHT_SESSION_TOKEN;
const defaultTeamId = process.env.UPLIGHT_TEAM_ID;

if (!apiUrl) {
  console.error("UPLIGHT_API_URL environment variable is required");
  process.exit(1);
}

if (!sessionToken) {
  console.error("UPLIGHT_SESSION_TOKEN environment variable is required");
  process.exit(1);
}

if (defaultTeamId && !/^\d+$/.test(defaultTeamId)) {
  console.error("UPLIGHT_TEAM_ID must be a numeric team ID");
  process.exit(1);
}

const api = new UplightApiClient(apiUrl, sessionToken, defaultTeamId);

const server = new McpServer({
  name: "uplight",
  version: "0.1.0",
});

registerMonitorTools(server, api);
registerIncidentTools(server, api);
registerHeartbeatTools(server, api);
registerOverviewTools(server, api);

const transport = new StdioServerTransport();
await server.connect(transport);
