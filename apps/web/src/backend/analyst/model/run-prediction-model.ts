import { env } from "cloudflare:workers";
import { z } from "zod";

const predictionResponseSchema = z.object({
  failure_probability: z.number().min(0).max(1),
  horizon: z.enum(["1h", "3h", "6h"]),
  signals: z.array(z.string()).default([]),
  reasoning: z.string(),
  summary: z.string().optional().nullable(),
});

export type PredictionModelResponse = z.infer<typeof predictionResponseSchema>;

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

export async function runPredictionModel(
  monitor: { name: string; url: string | null },
  hourlyAggregates: Array<{
    hourMs: number;
    avgResponseMs: number;
    p95ResponseMs: number;
    errorRate: number;
    checkCount: number;
  }>,
  recentMetrics: Array<{
    checkedAtMs: number;
    responseTime: number;
    result: string;
  }>,
): Promise<PredictionModelResponse> {
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

  const hourlyContext = hourlyAggregates
    .slice(0, 200)
    .map(
      (row) =>
        `${new Date(row.hourMs).toISOString()} avg=${Math.round(row.avgResponseMs)} p95=${Math.round(row.p95ResponseMs)} err=${(row.errorRate * 100).toFixed(2)}% checks=${row.checkCount}`,
    )
    .join("\n");

  const recentContext = recentMetrics
    .slice(0, 300)
    .map(
      (row) =>
        `${new Date(row.checkedAtMs).toISOString()} result=${row.result} response_ms=${row.responseTime}`,
    )
    .join("\n");

  const prompt = `
Given 7 days of hourly metric aggregates and the last 24 hours at full resolution,
predict whether this service will experience an outage in the next 1-6 hours.

Service: ${monitor.url ?? monitor.name}

Look for: gradual latency drift, rising error rates, and deviation from expected time-of-day patterns.

7-day hourly aggregates:
${hourlyContext}

Last 24h full resolution:
${recentContext}

Respond only with JSON:
{
  "failure_probability": number, // 0..1
  "horizon": "1h" | "3h" | "6h",
  "signals": ["string"],
  "reasoning": "string",
  "summary": "string"
}
`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

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
      throw new Error("Prediction model response content missing");
    }

    const parsedJson = JSON.parse(extractJson(rawContent));
    return predictionResponseSchema.parse(parsedJson);
  } finally {
    clearTimeout(timeout);
  }
}
