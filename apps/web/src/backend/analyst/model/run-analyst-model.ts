import { env } from "cloudflare:workers";
import { z } from "zod";
import type {
  AnalystMetric,
  MonitorBaselineSnapshot,
} from "../scoring/detect-anomaly";

const analystModelResponseSchema = z.object({
  severity: z.enum(["healthy", "watch", "warning", "critical"]),
  anomalies: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
      }),
    )
    .default([]),
  prediction: z
    .object({
      likely_outage: z.boolean(),
      horizon: z.string(),
      reasoning: z.string(),
    })
    .nullable()
    .optional(),
  summary: z.string(),
});

export type AnalystModelResponse = z.infer<typeof analystModelResponseSchema>;

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatMetrics(metrics: AnalystMetric[]): string {
  return metrics
    .slice(0, 120)
    .map(
      (m) =>
        `${new Date(m.checkedAtMs).toISOString()} | result=${m.result} | response_ms=${m.responseTime}`,
    )
    .join("\n");
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) return trimmed;

  const firstNewline = trimmed.indexOf("\n");
  if (firstNewline < 0) return trimmed;
  const withoutFence = trimmed.slice(firstNewline + 1);
  const closingFence = withoutFence.lastIndexOf("```");
  if (closingFence < 0) return withoutFence.trim();
  return withoutFence.slice(0, closingFence).trim();
}

function resolveGatewayUrl(): string {
  const envWithGateway = env as Env & {
    AI_GATEWAY_URL?: string;
    AI_GATEWAY_ACCOUNT_ID?: string;
    AI_GATEWAY_NAME?: string;
  };

  if (envWithGateway.AI_GATEWAY_URL) {
    return envWithGateway.AI_GATEWAY_URL;
  }

  if (envWithGateway.AI_GATEWAY_ACCOUNT_ID && envWithGateway.AI_GATEWAY_NAME) {
    return `https://gateway.ai.cloudflare.com/v1/${envWithGateway.AI_GATEWAY_ACCOUNT_ID}/${envWithGateway.AI_GATEWAY_NAME}/openai/chat/completions`;
  }

  throw new Error(
    "AI Gateway URL not configured. Set AI_GATEWAY_URL or AI_GATEWAY_ACCOUNT_ID + AI_GATEWAY_NAME.",
  );
}

export async function runAnalystModel(
  monitor: { name: string; url: string | null },
  metrics: AnalystMetric[],
  baseline: MonitorBaselineSnapshot,
  signals: string[],
): Promise<AnalystModelResponse> {
  const envWithAuth = env as Env & {
    AI_GATEWAY_API_KEY?: string;
    AI_GATEWAY_API_TOKEN?: string;
    AI_GATEWAY_MODEL?: string;
  };

  if (!envWithAuth.AI_GATEWAY_API_KEY && !envWithAuth.AI_GATEWAY_API_TOKEN) {
    throw new Error(
      "AI Gateway auth is missing. Set AI_GATEWAY_API_KEY and/or AI_GATEWAY_API_TOKEN.",
    );
  }

  const gatewayUrl = resolveGatewayUrl();
  const model = envWithAuth.AI_GATEWAY_MODEL ?? "gpt-4o-mini";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (envWithAuth.AI_GATEWAY_API_KEY) {
    headers.Authorization = `Bearer ${envWithAuth.AI_GATEWAY_API_KEY}`;
  }

  if (envWithAuth.AI_GATEWAY_API_TOKEN) {
    headers["cf-aig-authorization"] =
      `Bearer ${envWithAuth.AI_GATEWAY_API_TOKEN}`;
  }

  const prompt = `
You are an uptime analyst. Identify the severity of this anomaly and predict
whether a full outage is likely in the next 1-6 hours.

Service: ${monitor.url ?? monitor.name}
Baseline: avg ${Math.round(baseline.avgResponseMs)}ms, p95 ${Math.round(baseline.p95ResponseMs)}ms, error rate ${pct(baseline.avgErrorRate)}
Signals detected: ${signals.join(", ")}
Last 2h metrics (newest first):
${formatMetrics(metrics)}

Respond only with JSON:
{
  "severity": "healthy" | "watch" | "warning" | "critical",
  "anomalies": [{ "type": "string", "description": "string" }],
  "prediction": { "likely_outage": boolean, "horizon": "string", "reasoning": "string" } | null,
  "summary": "string"
}
`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(gatewayUrl, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Gateway request failed: ${res.status} ${body}`);
    }

    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const rawContent = payload.choices?.[0]?.message?.content;
    if (!rawContent || typeof rawContent !== "string") {
      throw new Error("Model response content missing");
    }

    const parsedJson = JSON.parse(extractJson(rawContent));
    return analystModelResponseSchema.parse(parsedJson);
  } finally {
    clearTimeout(timeout);
  }
}
