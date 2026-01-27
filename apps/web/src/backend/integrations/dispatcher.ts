import { and, eq } from "drizzle-orm";
import { createDb } from "../db";
import { integration } from "../db/schema";
import { buildAlertMessage, buildRecoveryMessage } from "./message-builder";
import type {
  IntegrationContext,
  IntegrationType,
  QueueMessage,
} from "./types";

export async function dispatchIntegrations(
  ctx: IntegrationContext,
): Promise<void> {
  const db = createDb(ctx.env.DB);

  const enabledIntegrations = await db
    .select()
    .from(integration)
    .where(
      and(eq(integration.teamId, ctx.teamId), eq(integration.enabled, true)),
    );

  if (enabledIntegrations.length === 0) {
    return;
  }

  if (ctx.incidentEvents.length === 0) {
    return;
  }

  const messages: QueueMessage[] = [];

  for (const event of ctx.incidentEvents) {
    let integrationMessage;

    if (event.type === "created") {
      integrationMessage = await buildAlertMessage(
        event,
        ctx.monitorId,
        ctx.monitorName,
        ctx.teamId,
        ctx.results,
        ctx.env,
      );
    } else if (event.type === "resolved") {
      integrationMessage = await buildRecoveryMessage(
        event,
        ctx.monitorId,
        ctx.monitorName,
        ctx.teamId,
        ctx.env,
      );
    } else {
      continue;
    }

    for (const integrationRecord of enabledIntegrations) {
      messages.push({
        integrationId: integrationRecord.id,
        integrationType: integrationRecord.type as IntegrationType,
        config: integrationRecord.config,
        message: integrationMessage,
      });
    }
  }

  if (messages.length === 0) {
    return;
  }

  // Check if queue is available (Cloudflare Queue binding)
  if (ctx.env.INTEGRATIONS_QUEUE) {
    // Send messages to the queue for async processing with retry
    await ctx.env.INTEGRATIONS_QUEUE.sendBatch(
      messages.map((msg) => ({ body: msg })),
    );
    console.log(
      `[INTEGRATIONS] Queued ${messages.length} integration messages`,
    );
  } else {
    // Fallback: process synchronously (for local dev or if queue not configured)
    console.log(
      `[INTEGRATIONS] Queue not available, processing ${messages.length} messages synchronously`,
    );
    const { handleIntegrationMessage } = await import("./queue-handler");
    await Promise.allSettled(
      messages.map((msg) => handleIntegrationMessage(msg, ctx.env)),
    );
  }
}
