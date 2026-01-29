import { z } from "@hono/zod-openapi";
import { formatDuration } from "../../lib/utils";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const OpsgenieConfigSchema = z
  .object({
    apiKey: z.string().min(1),
    region: z.enum(["us", "eu"]).default("us"),
    priority: z.enum(["P1", "P2", "P3", "P4", "P5"]).default("P3"),
  })
  .openapi("OpsgenieConfig");

export type OpsgenieConfig = z.infer<typeof OpsgenieConfigSchema>;

function getOpsgenieBaseUrl(region: "us" | "eu"): string {
  return region === "eu"
    ? "https://api.eu.opsgenie.com"
    : "https://api.opsgenie.com";
}

async function sendOpsgenieWithRetry(
  url: string,
  apiKey: string,
  payload: unknown,
  method = "POST",
  retries = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `GenieKey ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Opsgenie API failed: ${response.status} - ${errorText}`);
      }
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Opsgenie delivery attempt ${attempt}/${retries} failed:`,
        lastError.message
      );

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }
  }

  console.error(`Opsgenie delivery failed after ${retries} attempts`);
  throw lastError;
}

export const opsgenieProvider: IntegrationProvider<OpsgenieConfig> = {
  type: "opsgenie",
  configSchema: OpsgenieConfigSchema,

  async send(config: OpsgenieConfig, message: IntegrationMessage, _env: Env) {
    const baseUrl = getOpsgenieBaseUrl(config.region);

    if (message.type === "alert") {
      const payload = {
        message: message.title,
        alias: `uplight-incident-${message.incidentId}`,
        description: message.description,
        priority: config.priority,
        source: "Uplight",
        tags: ["uplight", message.monitorName],
        details: {
          cause: message.cause,
          locations: message.locations.join(", "),
          error_message: message.errorMessage || "N/A",
          hint: message.hint || "N/A",
          monitor_id: String(message.monitorId),
          incident_id: String(message.incidentId),
          severity: message.severity || "unknown",
        },
      };

      await sendOpsgenieWithRetry(`${baseUrl}/v2/alerts`, config.apiKey, payload);
    }

    if (message.type === "recovery") {
      const alias = `uplight-incident-${message.incidentId}`;
      const payload = {
        source: "Uplight",
        note: `Monitor ${message.monitorName} is back UP. Downtime: ${formatDuration(message.duration ?? 0)}`,
      };

      await sendOpsgenieWithRetry(
        `${baseUrl}/v2/alerts/${alias}/close?identifierType=alias`,
        config.apiKey,
        payload
      );
    }
  },
};
