import { normalizeProviderResponse } from "../providers/normalize-provider-status";
import { PROVIDERS } from "../providers/provider-catalog";
import { upsertProviderStatus } from "../repositories/provider-status-repo";

const FETCH_TIMEOUT_MS = 5_000;
const MAX_RAW_LENGTH = 25_000;

function parseRawPayload(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function encodeRawJson(raw: unknown): string {
  if (typeof raw === "string") {
    return raw.slice(0, MAX_RAW_LENGTH);
  }

  try {
    return JSON.stringify(raw).slice(0, MAX_RAW_LENGTH);
  } catch {
    return JSON.stringify({ error: "Failed to serialize provider payload" });
  }
}

export async function runProviderPoller(env: Env): Promise<void> {
  const nowMs = Date.now();
  let degradedCount = 0;

  const results = await Promise.allSettled(
    PROVIDERS.map(async (provider) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const res = await fetch(provider.url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Provider request failed: HTTP ${res.status}`);
        }

        const text = await res.text();
        const raw = parseRawPayload(text);
        const normalized = normalizeProviderResponse(provider.parserType, raw);

        await upsertProviderStatus(env, {
          provider: provider.name,
          status: normalized.status,
          description: normalized.description,
          sinceMs: normalized.sinceMs,
          polledAtMs: nowMs,
          sourceUrl: provider.url,
          rawJson: encodeRawJson(raw),
          updatedAtMs: nowMs,
        });

        if (
          normalized.status === "degraded" ||
          normalized.status === "outage"
        ) {
          degradedCount++;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown fetch error";

        await upsertProviderStatus(env, {
          provider: provider.name,
          status: "unknown",
          description: message,
          sinceMs: null,
          polledAtMs: nowMs,
          sourceUrl: provider.url,
          rawJson: JSON.stringify({ error: message }),
          updatedAtMs: nowMs,
        });
      } finally {
        clearTimeout(timeout);
      }
    }),
  );

  const fulfilled = results.filter((r) => r.status === "fulfilled").length;
  console.log(
    `[provider-poller] ${fulfilled}/${PROVIDERS.length} polled (${degradedCount} degraded)`,
  );
}
