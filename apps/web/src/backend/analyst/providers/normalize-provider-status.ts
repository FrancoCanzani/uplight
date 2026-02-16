import type { ProviderParserType, ProviderStatus } from "./provider-catalog";

const INDICATOR_MAP: Record<string, ProviderStatus> = {
  none: "operational",
  minor: "degraded",
  major: "outage",
  critical: "outage",
};

function parseTimestampMs(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 1_000_000_000_000) return value;
    if (value > 1_000_000_000) return value * 1000;
    return null;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return parseTimestampMs(numeric);
  }

  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return null;
  return ts;
}

function mapStatusFromText(text: string): ProviderStatus {
  const normalized = text.toLowerCase();

  if (
    /major outage|critical outage|service outage|global outage|unavailable|down\b|fully down/.test(
      normalized,
    )
  ) {
    return "outage";
  }

  if (
    /degraded|partial outage|minor outage|performance issues?|impaired|disruption/.test(
      normalized,
    )
  ) {
    return "degraded";
  }

  if (
    /operational|operating normally|all systems operational|available|healthy|normal/.test(
      normalized,
    )
  ) {
    return "operational";
  }

  return "unknown";
}

function normalizeStatuspageResponse(raw: unknown): {
  status: ProviderStatus;
  description: string;
  sinceMs: number | null;
} {
  if (typeof raw !== "object" || raw === null) {
    return {
      status: "unknown",
      description: "Failed to parse response",
      sinceMs: null,
    };
  }

  const obj = raw as Record<string, unknown>;
  const statusObj = obj.status as Record<string, unknown> | undefined;
  if (!statusObj || typeof statusObj !== "object") {
    return {
      status: "unknown",
      description: "Missing status object",
      sinceMs: null,
    };
  }

  const indicator = String(statusObj.indicator ?? "").toLowerCase();
  const description = String(statusObj.description ?? "No description");
  const status =
    INDICATOR_MAP[indicator] ?? mapStatusFromText(description) ?? "unknown";

  const page = obj.page as Record<string, unknown> | undefined;
  const sinceMs = parseTimestampMs(
    page?.updated_at ?? page?.updatedAt ?? obj.updated_at,
  );

  return { status, description, sinceMs };
}

function normalizeAwsHealthResponse(raw: unknown): {
  status: ProviderStatus;
  description: string;
  sinceMs: number | null;
} {
  if (typeof raw === "string") {
    const status = mapStatusFromText(raw);
    return {
      status,
      description: raw.slice(0, 280),
      sinceMs: null,
    };
  }

  if (typeof raw !== "object" || raw === null) {
    return {
      status: "unknown",
      description: "Failed to parse AWS status response",
      sinceMs: null,
    };
  }

  const obj = raw as Record<string, unknown>;
  const current = obj.current as Record<string, unknown> | undefined;
  const health = obj.health as Record<string, unknown> | undefined;

  const statusText = String(
    obj.status ??
      obj.overall_status ??
      current?.status ??
      health?.status ??
      current?.description ??
      obj.description ??
      "",
  );

  const description = String(
    obj.description ??
      current?.description ??
      health?.description ??
      obj.message ??
      statusText ??
      "No description",
  );

  const sinceMs = parseTimestampMs(
    obj.updated_at ??
      obj.updatedAt ??
      obj.last_updated ??
      obj.timestamp ??
      current?.updated_at,
  );

  return {
    status: mapStatusFromText(statusText || description),
    description,
    sinceMs,
  };
}

export function normalizeProviderResponse(
  parserType: ProviderParserType,
  raw: unknown,
): {
  status: ProviderStatus;
  description: string;
  sinceMs: number | null;
} {
  switch (parserType) {
    case "aws_health":
      return normalizeAwsHealthResponse(raw);
    case "statuspage_v2":
    default:
      return normalizeStatuspageResponse(raw);
  }
}
