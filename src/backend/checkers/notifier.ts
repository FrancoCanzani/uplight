import type { CheckResult } from "./types";
import type { IncidentEvent } from "./incident-manager";
import { formatDuration } from "../lib/utils";

interface NotificationContext {
  monitorId: number;
  monitorName: string;
  teamId: number;
  oldStatus: string;
  newStatus: string;
  results: CheckResult[];
  incidentEvents: IncidentEvent[];
}

export async function sendNotifications(
  ctx: NotificationContext
): Promise<void> {
  const failedLocations = ctx.results
    .filter((r) => r.status !== "success")
    .map((r) => r.location);

  for (const event of ctx.incidentEvents) {
    if (event.type === "created") {
      console.log("[EMAIL] Would send alert:", {
        to: `team-${ctx.teamId}-owners@example.com`,
        subject: `🔴 Monitor DOWN: ${ctx.monitorName}`,
        body: {
          monitorId: ctx.monitorId,
          incidentId: event.incidentId,
          cause: event.cause,
          affectedLocations: failedLocations,
          firstError: ctx.results.find((r) => r.status !== "success")
            ?.errorMessage,
        },
      });

      console.log("[SLACK] Would post:", {
        channel: "#alerts",
        text: `🔴 *${ctx.monitorName}* is DOWN`,
        blocks: {
          cause: event.cause,
          locations: failedLocations.join(", "),
        },
      });
    }

    if (event.type === "resolved") {
      console.log("[EMAIL] Would send recovery:", {
        to: `team-${ctx.teamId}-owners@example.com`,
        subject: `✅ Monitor RECOVERED: ${ctx.monitorName}`,
        body: {
          monitorId: ctx.monitorId,
          incidentId: event.incidentId,
          cause: event.cause,
          downtimeDuration: formatDuration(event.duration ?? 0),
        },
      });

      console.log("[SLACK] Would post:", {
        channel: "#alerts",
        text: `✅ *${ctx.monitorName}* is back UP`,
        blocks: {
          cause: event.cause,
          downtime: formatDuration(event.duration ?? 0),
        },
      });
    }
  }

  if (ctx.oldStatus !== ctx.newStatus) {
    console.log("[STATUS_CHANGE]", {
      monitorId: ctx.monitorId,
      monitorName: ctx.monitorName,
      from: ctx.oldStatus,
      to: ctx.newStatus,
    });
  }
}
