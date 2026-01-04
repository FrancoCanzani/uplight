import { generateText, Output } from "ai";
import { z } from "zod";
import type { IncidentCause } from "../types";

const parsedIncidentSchema = z.object({
  title: z.string(),
  description: z.string(),
  hint: z.string(),
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

export async function parseIncidentWithAI(
  ctx: IncidentContext,
): Promise<ParsedIncident> {
  const { output } = await generateText({
    model: "openai/gpt-5-mini",
    output: Output.object({
      schema: parsedIncidentSchema,
    }),
    prompt: buildPrompt(ctx),
  });

  return output;
}

function buildPrompt(ctx: IncidentContext): string {
  const details = [
    `Cause: ${ctx.cause.replace(/_/g, " ")}`,
    `Monitor: ${ctx.monitorName}`,
    ctx.monitorUrl && `URL: ${ctx.monitorUrl}`,
    ctx.statusCode && `HTTP status: ${ctx.statusCode}`,
    ctx.errorMessage && `Error: ${ctx.errorMessage}`,
    ctx.responseTime && `Response time: ${ctx.responseTime}ms`,
    ctx.location && `Region: ${ctx.location}`,
  ]
    .filter(Boolean)
    .join("\n");

  const solutions = CAUSE_SOLUTIONS[ctx.cause];

  return `You are an uptime monitoring assistant. Analyze this incident and help the user understand and fix it.

INCIDENT:
${details}

POSSIBLE SOLUTIONS FOR THIS CAUSE:
${solutions}

Generate a concise title, clear description, and a specific actionable hint. The hint should be the most likely solution based on the error details provided.`;
}
