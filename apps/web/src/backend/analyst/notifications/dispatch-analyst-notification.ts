import { and, eq } from "drizzle-orm";
import { createDb } from "../../db";
import { integration } from "../../db/schema";
import type { IntegrationMessage, IntegrationType, QueueMessage } from "../../integrations/types";

function mapFindingSeverity(
  severity: "healthy" | "watch" | "warning" | "critical" | "predicted",
): "low" | "medium" | "high" | "critical" | null {
  if (severity === "critical") return "critical";
  if (severity === "warning") return "high";
  if (severity === "predicted") return "medium";
  if (severity === "watch") return "low";
  return null;
}

export async function dispatchAnalystNotification(
  env: Env,
  input: {
    teamId: number;
    monitorId: number;
    monitorName: string;
    severity: "healthy" | "watch" | "warning" | "critical" | "predicted";
    summary: string;
    signalHint: string | null;
    locations: string[];
  },
): Promise<void> {
  const db = createDb(env.DB);
  const enabledIntegrations = await db
    .select()
    .from(integration)
    .where(and(eq(integration.teamId, input.teamId), eq(integration.enabled, true)));

  if (enabledIntegrations.length === 0) {
    return;
  }

  const integrationMessage: IntegrationMessage = {
    type: "alert",
    monitorId: input.monitorId,
    monitorName: input.monitorName,
    teamId: input.teamId,
    incidentId: 0,
    title: `Analyst ${input.severity.toUpperCase()}: ${input.monitorName}`,
    description: input.summary,
    cause: "analyst_anomaly",
    severity: mapFindingSeverity(input.severity),
    hint: input.signalHint,
    locations: input.locations,
    errorMessage: null,
    timestamp: new Date().toISOString(),
  };

  const messages: QueueMessage[] = enabledIntegrations.map((record) => ({
    integrationId: record.id,
    integrationType: record.type as IntegrationType,
    config: record.config,
    message: integrationMessage,
  }));

  if (messages.length === 0) {
    return;
  }

  if (env.INTEGRATIONS_QUEUE) {
    await env.INTEGRATIONS_QUEUE.sendBatch(messages.map((msg) => ({ body: msg })));
    return;
  }

  const { handleIntegrationMessage } = await import("../../integrations/queue-handler");
  await Promise.allSettled(messages.map((msg) => handleIntegrationMessage(msg, env)));
}
