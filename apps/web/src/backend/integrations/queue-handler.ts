import { providers } from "./providers";
import type { IntegrationType, QueueMessage } from "./types";

export async function handleIntegrationMessage(
  msg: QueueMessage,
  env: Env,
): Promise<void> {
  const provider = providers[msg.integrationType];
  if (!provider) {
    console.error(
      `[INTEGRATIONS] Unknown integration type: ${msg.integrationType}`,
    );
    return;
  }

  let parsedConfig: unknown;
  try {
    parsedConfig = JSON.parse(msg.config);
  } catch {
    console.error(
      `[INTEGRATIONS] Invalid JSON config for ${msg.integrationType} integration ${msg.integrationId}`,
    );
    return;
  }

  const validatedConfig = provider.configSchema.safeParse(parsedConfig);
  if (!validatedConfig.success) {
    console.error(
      `[INTEGRATIONS] Invalid config for ${msg.integrationType} integration ${msg.integrationId}:`,
      validatedConfig.error,
    );
    return;
  }

  await provider.send(validatedConfig.data, msg.message, env);
  console.log(
    `[INTEGRATIONS] Sent ${msg.message.type} message via ${msg.integrationType} for incident ${msg.message.incidentId}`,
  );
}

export async function handleIntegrationQueue(
  batch: MessageBatch<QueueMessage>,
  env: Env,
): Promise<void> {
  console.log(
    `[INTEGRATIONS] Processing batch of ${batch.messages.length} messages`,
  );

  const results = await Promise.allSettled(
    batch.messages.map(async (message) => {
      try {
        await handleIntegrationMessage(message.body, env);
        message.ack();
      } catch (error) {
        console.error(
          `[INTEGRATIONS] Failed to process ${message.body.integrationType} integration:`,
          error,
        );
        // Retry the message
        message.retry();
      }
    }),
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(
    `[INTEGRATIONS] Batch complete: ${succeeded} succeeded, ${failed} failed`,
  );
}
