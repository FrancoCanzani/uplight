import { env } from "cloudflare:workers";
import { z } from "zod";

const correlationModelResponseSchema = z.object({
  matched: z.boolean(),
  provider: z.string().nullable().optional(),
  provider_url: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).default(0.5),
  reasoning: z.string().default(""),
  summary: z.string().default(""),
});

export type CorrelationModelResponse = z.infer<
  typeof correlationModelResponseSchema
>;

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

export async function runCorrelationModel(
  failingMonitors: Array<{
    id: number;
    name: string;
    url: string | null;
    score: number;
    signals: string[];
  }>,
  degradedProviders: Array<{
    provider: string;
    status: string;
    description: string | null;
    sinceMs: number | null;
    sourceUrl: string;
  }>,
): Promise<CorrelationModelResponse> {
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

  const monitorContext = failingMonitors
    .slice(0, 20)
    .map(
      (m) =>
        `${m.name} (${m.url ?? "no-url"}) score=${m.score.toFixed(2)} signals=${m.signals.join("; ")}`,
    )
    .join("\n");

  const providerContext = degradedProviders
    .slice(0, 20)
    .map(
      (p) =>
        `${p.provider} status=${p.status} since=${p.sinceMs ? new Date(p.sinceMs).toISOString() : "unknown"} desc="${p.description ?? "none"}" url=${p.sourceUrl}`,
    )
    .join("\n");

  const prompt = `
You are an uptime analyst. Determine whether a simultaneous multi-monitor anomaly
is likely caused by a third-party provider outage.

Failing monitors:
${monitorContext}

Degraded providers:
${providerContext}

Respond only with JSON:
{
  "matched": boolean,
  "provider": "string | null",
  "provider_url": "string | null",
  "confidence": number, // 0..1
  "reasoning": "string",
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
      throw new Error("Correlation model response content missing");
    }

    const parsedJson = JSON.parse(extractJson(rawContent));
    return correlationModelResponseSchema.parse(parsedJson);
  } finally {
    clearTimeout(timeout);
  }
}
