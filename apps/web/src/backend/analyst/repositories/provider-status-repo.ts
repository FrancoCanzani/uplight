import { and, gt, inArray } from "drizzle-orm";
import { createDb } from "../../db";
import { providerStatus } from "../../db/schema";
import type { ProviderStatus } from "../providers/provider-catalog";

export interface ProviderStatusRow {
  provider: string;
  status: ProviderStatus;
  description: string | null;
  sinceMs: number | null;
  polledAtMs: number;
  sourceUrl: string;
  rawJson: string;
  updatedAtMs: number;
}

export async function upsertProviderStatus(env: Env, row: ProviderStatusRow) {
  const db = createDb(env.DB);
  await db
    .insert(providerStatus)
    .values(row)
    .onConflictDoUpdate({
      target: providerStatus.provider,
      set: {
        status: row.status,
        description: row.description,
        sinceMs: row.sinceMs,
        polledAtMs: row.polledAtMs,
        sourceUrl: row.sourceUrl,
        rawJson: row.rawJson,
        updatedAtMs: row.updatedAtMs,
      },
    });
}

export async function getDegradedProviders(env: Env, lookbackMs: number) {
  const db = createDb(env.DB);
  const cutoff = Date.now() - lookbackMs;
  return db
    .select()
    .from(providerStatus)
    .where(
      and(
        inArray(providerStatus.status, ["degraded", "outage"]),
        gt(providerStatus.polledAtMs, cutoff),
      ),
    );
}

export async function getAllProviderStatuses(env: Env) {
  const db = createDb(env.DB);
  return db.select().from(providerStatus);
}
