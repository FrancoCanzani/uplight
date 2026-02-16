export type ProviderStatus = "operational" | "degraded" | "outage" | "unknown";
export type ProviderParserType = "statuspage_v2" | "aws_health";

export interface ProviderEntry {
  name: string;
  url: string;
  parserType: ProviderParserType;
}

export const PROVIDERS: ProviderEntry[] = [
  {
    name: "stripe",
    url: "https://status.stripe.com/api/v2/status.json",
    parserType: "statuspage_v2",
  },
  {
    name: "vercel",
    url: "https://www.vercel-status.com/api/v2/status.json",
    parserType: "statuspage_v2",
  },
  {
    name: "supabase",
    url: "https://status.supabase.com/api/v2/status.json",
    parserType: "statuspage_v2",
  },
  {
    name: "github",
    url: "https://www.githubstatus.com/api/v2/status.json",
    parserType: "statuspage_v2",
  },
  {
    name: "cloudflare",
    url: "https://www.cloudflarestatus.com/api/v2/status.json",
    parserType: "statuspage_v2",
  },
  {
    name: "datadog",
    url: "https://status.datadoghq.com/api/v2/status.json",
    parserType: "statuspage_v2",
  },
  {
    name: "pagerduty",
    url: "https://status.pagerduty.com/api/v2/status.json",
    parserType: "statuspage_v2",
  },
  {
    name: "aws",
    url: "https://health.aws.amazon.com/health/status",
    parserType: "aws_health",
  },
];

export interface StatuspageResponse {
  page: {
    updated_at: string;
  };
  status: {
    indicator: string;
    description: string;
  };
}
