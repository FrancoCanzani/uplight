import type {
  DnsCheckRequest,
  DnsResolver,
  DnsRecordType,
  RawCheckResult,
} from "../types";

interface DnsJsonAnswer {
  type: number;
  data: string;
}

interface DnsJsonResponse {
  Status: number;
  Answer?: DnsJsonAnswer[];
}

const RESOLVER_URLS: Record<DnsResolver, string> = {
  cloudflare: "https://cloudflare-dns.com/dns-query",
  google: "https://dns.google/resolve",
};

const DNS_MAX_RETRIES = 2;
const DNS_INITIAL_BACKOFF_MS = 200;

interface QueryResult {
  ok: boolean;
  answers: string[];
  rcode?: number;
  httpStatus?: number;
  error?: string;
  retryable: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeDnsValue(value: string): string {
  const trimmed = value.trim().replace(/^"|"$/g, "");
  return trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
}

function getFallbackResolver(resolver: DnsResolver): DnsResolver {
  return resolver === "cloudflare" ? "google" : "cloudflare";
}

async function queryDnsJson(
  hostname: string,
  recordType: DnsRecordType,
  resolver: DnsResolver,
  timeoutMs: number,
): Promise<QueryResult> {
  const baseUrl = RESOLVER_URLS[resolver];
  const queryUrl = `${baseUrl}?name=${encodeURIComponent(hostname)}&type=${encodeURIComponent(recordType)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(queryUrl, {
      headers: { Accept: "application/dns-json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      return {
        ok: false,
        answers: [],
        httpStatus: response.status,
        error: `Resolver returned HTTP ${response.status}`,
        retryable,
      };
    }

    const data = (await response.json()) as DnsJsonResponse;
    const rcode = data.Status;

    if (rcode !== 0) {
      const retryable = rcode === 2; // SERVFAIL
      return {
        ok: false,
        answers: [],
        rcode,
        error: `DNS query failed with rcode=${rcode}`,
        retryable,
      };
    }

    const answers = Array.isArray(data.Answer)
      ? data.Answer.map((answer) => normalizeDnsValue(answer.data))
      : [];

    return {
      ok: true,
      answers,
      rcode,
      retryable: false,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        answers: [],
        error: `DNS lookup timed out after ${timeoutMs}ms`,
        retryable: true,
      };
    }

    return {
      ok: false,
      answers: [],
      error: error instanceof Error ? error.message : "Unknown DNS error",
      retryable: true,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function resolveDnsWithRetry(
  hostname: string,
  recordType: DnsRecordType,
  preferredResolver: DnsResolver,
  timeoutMs: number,
): Promise<{ result: QueryResult; resolver: DnsResolver }> {
  const resolvers: DnsResolver[] = [
    preferredResolver,
    getFallbackResolver(preferredResolver),
  ];

  let lastResult: QueryResult = {
    ok: false,
    answers: [],
    error: "DNS lookup failed",
    retryable: false,
  };
  let lastResolver = preferredResolver;

  for (const resolver of resolvers) {
    for (let attempt = 0; attempt <= DNS_MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const backoff = DNS_INITIAL_BACKOFF_MS * 2 ** (attempt - 1);
        await delay(backoff);
      }

      const result = await queryDnsJson(
        hostname,
        recordType,
        resolver,
        timeoutMs,
      );

      if (result.ok || !result.retryable) {
        return { result, resolver };
      }

      lastResult = result;
      lastResolver = resolver;
    }
  }

  return { result: lastResult, resolver: lastResolver };
}

export async function checkDns(hostname: string): Promise<boolean> {
  const { result } = await resolveDnsWithRetry(
    hostname,
    "A",
    "cloudflare",
    3000,
  );

  return result.ok && result.answers.length > 0;
}

export async function performDnsCheck(
  request: DnsCheckRequest,
  timeout: number,
): Promise<RawCheckResult> {
  const startTime = performance.now();
  const assertionGroups = new Map<DnsRecordType, string[]>();
  for (const assertion of request.assertions) {
    const existing = assertionGroups.get(assertion.recordType) ?? [];
    existing.push(assertion.value);
    assertionGroups.set(assertion.recordType, existing);
  }

  const missingTypes: DnsRecordType[] = [];

  for (const [recordType, expectedValues] of assertionGroups) {
    const { result, resolver } = await resolveDnsWithRetry(
      request.host,
      recordType,
      request.resolver,
      timeout,
    );

    if (!result.ok) {
      return {
        result: "error",
        responseTime: Math.round(performance.now() - startTime),
        errorMessage:
          result.error ||
          `DNS lookup failed for ${request.host} (${recordType})`,
        cause: "dns_failure",
      };
    }

    if (result.answers.length === 0) {
      missingTypes.push(recordType);
      continue;
    }

    for (const rawExpected of expectedValues) {
      const expected = normalizeDnsValue(rawExpected).toLowerCase();
      if (!expected) {
        continue;
      }

      const matched = result.answers.some((answer) =>
        answer.toLowerCase().includes(expected),
      );
      if (!matched) {
        return {
          result: "failure",
          responseTime: Math.round(performance.now() - startTime),
          errorMessage: `Expected DNS value \"${rawExpected}\" not found in ${recordType} answers from ${resolver}`,
          cause: "dns_failure",
        };
      }
    }
  }

  const responseTime = Math.round(performance.now() - startTime);

  if (missingTypes.length > 0) {
    return {
      result: "failure",
      responseTime,
      errorMessage: `No records found for ${missingTypes.join(", ")} on ${request.host}`,
      cause: "dns_failure",
    };
  }

  return { result: "success", responseTime };
}
