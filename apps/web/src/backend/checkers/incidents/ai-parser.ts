import { generateObject } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { z } from "zod";
import type { IncidentCause } from "../types";

const parsedIncidentSchema = z.object({
  title: z.string().describe("Brief incident title, max 60 characters"),
  description: z.string().describe("One sentence describing what happened"),
  hint: z.string().describe("One actionable sentence to help resolve this"),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

export type ParsedIncident = z.infer<typeof parsedIncidentSchema>;

interface IncidentContext {
  cause: IncidentCause;
  monitorName: string;
  monitorUrl?: string;
  statusCode?: number;
  errorMessage?: string;
  responseTime?: number;
  location?: string;
  responseBody?: string;
}

const CAUSE_SOLUTIONS: Record<IncidentCause, string> = {
  http_5xx:
    "Check server logs, verify backend services are running, review recent deployments",
  http_4xx:
    "Verify endpoint exists, check authentication/authorization, review request parameters",
  http_3xx:
    "Review redirect chain, check for redirect loops, verify final destination",
  timeout:
    "Check server load, review slow queries, verify network connectivity, increase timeout threshold",
  connection_refused:
    "Verify service is running on correct port, check firewall rules, confirm host is reachable",
  dns_failure:
    "Verify DNS records, check nameserver configuration, confirm domain hasn't expired",
  ssl_error:
    "Check certificate expiration, verify certificate chain, ensure correct hostname in cert",
  content_mismatch:
    "Review expected content pattern, check if page content changed, verify correct page loads",
  tcp_failure:
    "Verify service is listening on port, check network path, review firewall rules",
  network_error:
    "Check network connectivity, verify no ISP issues, review routing configuration",
};

const RESPONSE_BODY_MAX = 2000;

export async function parseIncidentWithAI(
  ctx: IncidentContext,
  env: Env,
): Promise<ParsedIncident> {
  const workersAI = createWorkersAI({ binding: env.AI });

  const { object } = await generateObject({
    model: workersAI("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b"),
    schema: parsedIncidentSchema,
    prompt: buildPrompt(ctx),
  });

  return object;
}

function buildPrompt(ctx: IncidentContext): string {
  const details = [
    `Cause: ${ctx.cause.replace(/_/g, " ")}`,
    `Monitor: ${ctx.monitorName}`,
    ctx.monitorUrl && `URL: ${ctx.monitorUrl}`,
    ctx.statusCode && `HTTP status: ${ctx.statusCode}`,
    ctx.errorMessage && `Error: ${ctx.errorMessage}`,
    ctx.responseTime && `Response time: ${ctx.responseTime}ms`,
    ctx.location && `Location: ${ctx.location}`,
  ]
    .filter(Boolean)
    .join("\n");

  const solutions = CAUSE_SOLUTIONS[ctx.cause];

  const bodySection = ctx.responseBody
    ? `\n\nRESPONSE BODY (first ${RESPONSE_BODY_MAX} chars):\n${ctx.responseBody.slice(0, RESPONSE_BODY_MAX)}`
    : "";

  return `You are an uptime monitoring assistant. Analyze this incident and help the user understand and fix it.

INCIDENT:
${details}${bodySection}

POSSIBLE SOLUTIONS FOR THIS CAUSE:
${solutions}

Generate a brief title, short description, and a concise actionable hint. If a response body is provided, use it to make the hint more specific (e.g. reference actual error messages or missing content from the body). Keep all responses brief and to the point.`;
}
