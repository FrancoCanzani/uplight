import type { CheckConfig, RawCheckResult } from "../types";

const RETRIABLE_ERRORS = [
  "econnreset",
  "econnrefused",
  "etimedout",
  "fetch failed",
  "network",
  "dns",
];

function isRetriable(result: RawCheckResult): boolean {
  if (result.result === "timeout") return true;
  if (result.result === "error" && result.errorMessage) {
    const msg = result.errorMessage.toLowerCase();
    return RETRIABLE_ERRORS.some((e) => msg.includes(e));
  }
  return false;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry(
  checkFn: () => Promise<RawCheckResult>,
  config: CheckConfig
): Promise<RawCheckResult & { retryCount: number }> {
  let lastResult: RawCheckResult | null = null;
  let retryCount = 0;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = config.initialRetryDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * delay * 0.1;
      await sleep(delay + jitter);
      retryCount++;
    }

    lastResult = await checkFn();

    if (lastResult.result === "success") {
      return { ...lastResult, retryCount };
    }

    if (!isRetriable(lastResult)) {
      break;
    }
  }

  return { ...lastResult!, retryCount };
}
