import { eq, and } from "drizzle-orm";
import { createDb } from "../../db";
import { notifier, teamMember, incident } from "../../db/schema";
import { user } from "../../db/auth-schema";
import type { CheckResult } from "../types";
import type { IncidentEvent } from "../incidents/manager";
import { formatDuration } from "../../lib/utils";
import {
  EmailConfigSchema,
  SlackConfigSchema,
  DiscordConfigSchema,
  WebhookConfigSchema,
  GitHubConfigSchema,
  type EmailConfig,
  type SlackConfig,
  type DiscordConfig,
  type WebhookConfig,
  type GitHubConfig,
} from "../../routes/protected/notifications/schemas";

interface NotificationContext {
  monitorId: number;
  monitorName: string;
  teamId: number;
  oldStatus: string;
  newStatus: string;
  results: CheckResult[];
  incidentEvents: IncidentEvent[];
  env: Env;
}

async function getIncidentData(
  incidentId: number,
  env: Env
): Promise<{
  title: string | null;
  description: string | null;
  hint: string | null;
  severity: "low" | "medium" | "high" | "critical" | null;
  cause: string;
}> {
  const db = createDb(env.DB);
  const [incidentData] = await db
    .select({
      title: incident.title,
      description: incident.description,
      hint: incident.hint,
      severity: incident.severity,
      cause: incident.cause,
    })
    .from(incident)
    .where(eq(incident.id, incidentId))
    .limit(1);

  if (!incidentData) {
    return {
      title: null,
      description: null,
      hint: null,
      severity: null,
      cause: "",
    };
  }

  return {
    title: incidentData.title,
    description: incidentData.description,
    hint: incidentData.hint,
    severity:
      incidentData.severity === "low" ||
      incidentData.severity === "medium" ||
      incidentData.severity === "high" ||
      incidentData.severity === "critical"
        ? incidentData.severity
        : null,
    cause: incidentData.cause,
  };
}

async function sendEmailNotification(
  _config: EmailConfig,
  ctx: NotificationContext
): Promise<void> {
  const db = createDb(ctx.env.DB);

  const teamMembers = await db
    .select({
      email: user.email,
    })
    .from(teamMember)
    .innerJoin(user, eq(teamMember.userId, user.id))
    .where(eq(teamMember.teamId, ctx.teamId));

  const emails = teamMembers.map((m) => m.email);

  for (const event of ctx.incidentEvents) {
    if (event.type === "created") {
      const incidentData = await getIncidentData(event.incidentId, ctx.env);
      const failedLocations = ctx.results
        .filter((r) => r.result !== "success")
        .map((r) => r.location);
      const firstError = ctx.results.find(
        (r) => r.result !== "success"
      )?.errorMessage;

      const title = incidentData.title || `Monitor DOWN: ${ctx.monitorName}`;
      const description =
        incidentData.description ||
        `Monitor "${ctx.monitorName}" is currently down.`;
      const cause = incidentData.cause || event.cause;

      let body = `${description}\n\n`;
      body += `Incident ID: ${event.incidentId}\n`;
      if (incidentData.severity) {
        body += `Severity: ${incidentData.severity.toUpperCase()}\n`;
      }
      body += `Cause: ${cause}\n`;
      body += `Affected Locations: ${failedLocations.join(", ")}\n`;
      if (firstError) {
        body += `Error: ${firstError}\n`;
      }
      if (incidentData.hint) {
        body += `\nHint: ${incidentData.hint}\n`;
      }
      body += `\nMonitor ID: ${ctx.monitorId}`;

      console.log("[EMAIL] Sending alert:", {
        to: emails,
        subject: `🔴 ${title}`,
        body,
      });
    }

    if (event.type === "resolved") {
      const incidentData = await getIncidentData(event.incidentId, ctx.env);
      const title = `Monitor RECOVERED: ${ctx.monitorName}`;
      const cause = incidentData.cause || event.cause;

      let body = `Monitor "${ctx.monitorName}" is back UP.\n\n`;
      body += `Incident ID: ${event.incidentId}\n`;
      body += `Cause: ${cause}\n`;
      body += `Downtime Duration: ${formatDuration(event.duration ?? 0)}\n`;
      body += `\nMonitor ID: ${ctx.monitorId}`;

      console.log("[EMAIL] Sending recovery:", {
        to: emails,
        subject: `✅ ${title}`,
        body,
      });
    }
  }
}

async function sendSlackNotification(
  config: SlackConfig,
  ctx: NotificationContext
): Promise<void> {
  const failedLocations = ctx.results
    .filter((r) => r.result !== "success")
    .map((r) => r.location);

  for (const event of ctx.incidentEvents) {
    try {
      if (event.type === "created") {
        const incidentData = await getIncidentData(event.incidentId, ctx.env);
        const firstError = ctx.results.find(
          (r) => r.result !== "success"
        )?.errorMessage;

        const title = incidentData.title || `Monitor DOWN: ${ctx.monitorName}`;
        const description = incidentData.description || "";
        const cause = incidentData.cause || event.cause;

        let text = `🔴 *${title}*\n\n`;
        if (description) {
          text += `${description}\n\n`;
        }
        if (incidentData.severity) {
          text += `*Severity:* ${incidentData.severity.toUpperCase()}\n`;
        }
        text += `*Cause:* ${cause}\n`;
        text += `*Locations:* ${failedLocations.join(", ")}\n`;
        if (firstError) {
          text += `*Error:* ${firstError}\n`;
        }
        if (incidentData.hint) {
          text += `\n*Hint:* ${incidentData.hint}\n`;
        }
        text += `*Monitor ID:* ${ctx.monitorId}\n`;
        text += `*Incident ID:* ${event.incidentId}`;

        const payload = {
          text: `🔴 ${title}`,
          channel: config.channel,
          username: config.username,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text,
              },
            },
          ],
        };

        await fetch(config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (event.type === "resolved") {
        const incidentData = await getIncidentData(event.incidentId, ctx.env);
        const cause = incidentData.cause || event.cause;

        const text = `✅ *${ctx.monitorName}* is back UP\n\n*Cause:* ${cause}\n*Downtime:* ${formatDuration(event.duration ?? 0)}\n*Monitor ID:* ${ctx.monitorId}\n*Incident ID:* ${event.incidentId}`;

        const payload = {
          text: `✅ *${ctx.monitorName}* is back UP`,
          channel: config.channel,
          username: config.username,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text,
              },
            },
          ],
        };

        await fetch(config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.error("[SLACK] Failed to send notification:", error);
    }
  }
}

async function sendDiscordNotification(
  config: DiscordConfig,
  ctx: NotificationContext
): Promise<void> {
  const failedLocations = ctx.results
    .filter((r) => r.result !== "success")
    .map((r) => r.location);

  for (const event of ctx.incidentEvents) {
    try {
      if (event.type === "created") {
        const incidentData = await getIncidentData(event.incidentId, ctx.env);
        const firstError = ctx.results.find(
          (r) => r.result !== "success"
        )?.errorMessage;

        const title = incidentData.title || `Monitor DOWN: ${ctx.monitorName}`;
        const description =
          incidentData.description ||
          `Monitor "${ctx.monitorName}" is currently down.`;
        const cause = incidentData.cause || event.cause;

        const fields: Array<{
          name: string;
          value: string;
          inline: boolean;
        }> = [];

        if (incidentData.severity) {
          fields.push({
            name: "Severity",
            value: incidentData.severity.toUpperCase(),
            inline: true,
          });
        }
        fields.push({ name: "Cause", value: cause, inline: true });
        fields.push({
          name: "Locations",
          value: failedLocations.join(", ") || "N/A",
          inline: true,
        });
        fields.push({
          name: "Monitor ID",
          value: String(ctx.monitorId),
          inline: true,
        });
        fields.push({
          name: "Incident ID",
          value: String(event.incidentId),
          inline: true,
        });
        if (firstError) {
          fields.push({ name: "Error", value: firstError, inline: false });
        }
        if (incidentData.hint) {
          fields.push({
            name: "Hint",
            value: incidentData.hint,
            inline: false,
          });
        }

        const payload: Record<string, unknown> = {
          content: `🔴 **${title}**`,
          embeds: [
            {
              title,
              description,
              color: 15158332,
              fields,
              timestamp: new Date().toISOString(),
            },
          ],
        };

        if (config.username) payload.username = config.username;
        if (config.avatarUrl && config.avatarUrl !== "") {
          payload.avatar_url = config.avatarUrl;
        }

        await fetch(config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (event.type === "resolved") {
        const incidentData = await getIncidentData(event.incidentId, ctx.env);
        const cause = incidentData.cause || event.cause;

        const payload: Record<string, unknown> = {
          content: `✅ **${ctx.monitorName}** is back UP`,
          embeds: [
            {
              title: "Monitor Recovered",
              description: `Monitor "${ctx.monitorName}" has recovered.`,
              color: 3066993,
              fields: [
                { name: "Cause", value: cause, inline: true },
                {
                  name: "Downtime",
                  value: formatDuration(event.duration ?? 0),
                  inline: true,
                },
                {
                  name: "Monitor ID",
                  value: String(ctx.monitorId),
                  inline: true,
                },
                {
                  name: "Incident ID",
                  value: String(event.incidentId),
                  inline: true,
                },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        };

        if (config.username) payload.username = config.username;
        if (config.avatarUrl && config.avatarUrl !== "") {
          payload.avatar_url = config.avatarUrl;
        }

        await fetch(config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.error("[DISCORD] Failed to send notification:", error);
    }
  }
}

async function sendWebhookNotification(
  config: WebhookConfig,
  ctx: NotificationContext
): Promise<void> {
  const failedLocations = ctx.results
    .filter((r) => r.result !== "success")
    .map((r) => r.location);

  for (const event of ctx.incidentEvents) {
    try {
      if (event.type === "created") {
        const incidentData = await getIncidentData(event.incidentId, ctx.env);
        const firstError = ctx.results.find(
          (r) => r.result !== "success"
        )?.errorMessage;

        const payload = {
          event: "incident.created",
          monitor: {
            id: ctx.monitorId,
            name: ctx.monitorName,
          },
          incident: {
            id: event.incidentId,
            title: incidentData.title,
            description: incidentData.description,
            hint: incidentData.hint,
            severity: incidentData.severity,
            cause: incidentData.cause || event.cause,
          },
          locations: failedLocations,
          error: firstError || null,
          timestamp: new Date().toISOString(),
        };

        await fetch(config.url, {
          method: config.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (event.type === "resolved") {
        const incidentData = await getIncidentData(event.incidentId, ctx.env);

        const payload = {
          event: "incident.resolved",
          monitor: {
            id: ctx.monitorId,
            name: ctx.monitorName,
          },
          incident: {
            id: event.incidentId,
            cause: incidentData.cause || event.cause,
            duration: event.duration,
          },
          downtime: formatDuration(event.duration ?? 0),
          timestamp: new Date().toISOString(),
        };

        await fetch(config.url, {
          method: config.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.error("[WEBHOOK] Failed to send notification:", error);
    }
  }
}

async function sendGitHubNotification(
  config: GitHubConfig,
  ctx: NotificationContext
): Promise<void> {
  const failedLocations = ctx.results
    .filter((r) => r.result !== "success")
    .map((r) => r.location);

  for (const event of ctx.incidentEvents) {
    try {
      if (event.type === "created") {
        const incidentData = await getIncidentData(event.incidentId, ctx.env);
        const firstError = ctx.results.find(
          (r) => r.result !== "success"
        )?.errorMessage;
        const repoParts = config.repository.split("/");
        if (repoParts.length !== 2) {
          throw new Error(`Invalid repository format: ${config.repository}`);
        }
        const [owner, repo] = repoParts;

        const title =
          incidentData.title || `🔴 Monitor DOWN: ${ctx.monitorName}`;
        const cause = incidentData.cause || event.cause;

        let body = "";
        if (incidentData.description) {
          body += `${incidentData.description}\n\n`;
        } else {
          body += `Monitor "${ctx.monitorName}" is currently down.\n\n`;
        }

        body += "**Incident Details:**\n";
        body += `- Incident ID: ${event.incidentId}\n`;
        if (incidentData.severity) {
          body += `- Severity: ${incidentData.severity.toUpperCase()}\n`;
        }
        body += `- Cause: ${cause}\n`;
        body += `- Monitor ID: ${ctx.monitorId}\n`;
        body += `- Affected Locations: ${failedLocations.join(", ")}\n`;
        if (firstError) {
          body += `- Error: ${firstError}\n`;
        }
        if (incidentData.hint) {
          body += `\n**Hint:** ${incidentData.hint}\n`;
        }
        body += "\n---\n";
        body +=
          "This issue was automatically created by Uplight monitoring system.";

        const labels = ["incident", "monitoring"];
        if (incidentData.severity) {
          labels.push(`severity:${incidentData.severity}`);
        }
        labels.push(...(config.labels || []));

        const payload: Record<string, unknown> = {
          title,
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
      }
    } catch (error) {
      console.error("[GITHUB] Failed to create issue:", error);
    }
  }
}

export async function sendNotifications(
  ctx: NotificationContext
): Promise<void> {
  const db = createDb(ctx.env.DB);

  const enabledNotifiers = await db
    .select()
    .from(notifier)
    .where(and(eq(notifier.teamId, ctx.teamId), eq(notifier.enabled, true)));

  if (enabledNotifiers.length === 0) {
    return;
  }

  if (ctx.incidentEvents.length === 0) {
    return;
  }

  const promises = enabledNotifiers.map(async (notifierRecord) => {
    try {
      let parsedConfig: unknown;
      try {
        parsedConfig = JSON.parse(notifierRecord.config);
      } catch {
        console.error(
          `[NOTIFIER] Invalid JSON config for ${notifierRecord.type} notifier ${notifierRecord.id}`
        );
        return;
      }

      switch (notifierRecord.type) {
        case "email": {
          const config = EmailConfigSchema.parse(parsedConfig);
          await sendEmailNotification(config, ctx);
          break;
        }
        case "slack": {
          const config = SlackConfigSchema.parse(parsedConfig);
          await sendSlackNotification(config, ctx);
          break;
        }
        case "discord": {
          const config = DiscordConfigSchema.parse(parsedConfig);
          await sendDiscordNotification(config, ctx);
          break;
        }
        case "webhook": {
          const config = WebhookConfigSchema.parse(parsedConfig);
          await sendWebhookNotification(config, ctx);
          break;
        }
        case "github": {
          const config = GitHubConfigSchema.parse(parsedConfig);
          await sendGitHubNotification(config, ctx);
          break;
        }
        default:
          console.error(
            `[NOTIFIER] Unknown notifier type: ${notifierRecord.type satisfies never}`
          );
      }
    } catch (error) {
      console.error(
        `[NOTIFIER] Failed to send ${notifierRecord.type} notification:`,
        error
      );
    }
  });

  await Promise.allSettled(promises);
}
