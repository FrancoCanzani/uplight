import { z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { createDb } from "../../db";
import { user } from "../../db/auth-schema";
import { teamMember } from "../../db/schema";
import { formatDuration } from "../../lib/utils";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const EmailConfigSchema = z.object({}).openapi("EmailConfig");
export type EmailConfig = z.infer<typeof EmailConfigSchema>;

export const emailProvider: IntegrationProvider<EmailConfig> = {
  type: "email",
  configSchema: EmailConfigSchema,

  async send(_config: EmailConfig, message: IntegrationMessage, env: Env) {
    const db = createDb(env.DB);

    const teamMembers = await db
      .select({
        email: user.email,
      })
      .from(teamMember)
      .innerJoin(user, eq(teamMember.userId, user.id))
      .where(eq(teamMember.teamId, message.teamId));

    const emails = teamMembers.map((m) => m.email);

    if (message.type === "alert") {
      let body = `${message.description}\n\n`;
      body += `Incident ID: ${message.incidentId}\n`;
      if (message.severity) {
        body += `Severity: ${message.severity.toUpperCase()}\n`;
      }
      body += `Cause: ${message.cause}\n`;
      body += `Affected Locations: ${message.locations.join(", ")}\n`;
      if (message.errorMessage) {
        body += `Error: ${message.errorMessage}\n`;
      }
      if (message.hint) {
        body += `\nHint: ${message.hint}\n`;
      }
      body += `\nMonitor ID: ${message.monitorId}`;

      console.log("[EMAIL] Sending alert:", {
        to: emails,
        subject: `[Alert] ${message.title}`,
        body,
      });
    }

    if (message.type === "recovery") {
      let body = `Monitor "${message.monitorName}" is back UP.\n\n`;
      body += `Incident ID: ${message.incidentId}\n`;
      body += `Cause: ${message.cause}\n`;
      body += `Downtime Duration: ${formatDuration(message.duration ?? 0)}\n`;
      body += `\nMonitor ID: ${message.monitorId}`;

      console.log("[EMAIL] Sending recovery:", {
        to: emails,
        subject: `[Recovered] ${message.title}`,
        body,
      });
    }
  },
};
