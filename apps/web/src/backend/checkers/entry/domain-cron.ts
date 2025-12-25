import { and, eq, or } from "drizzle-orm";
import { parseISO, isValid } from "date-fns";
import { createDb } from "../../db";
import { monitor, domainCheckResult } from "../../db/schema";

interface DomainCheckerResponse {
  domain: string;
  whois: {
    data?: {
      created_date?: string;
      updated_date?: string;
      expiration_date?: string;
      registrar?: string;
    } | null;
    error?: string | null;
  };
  ssl: {
    data?: {
      issuer?: string;
      expiry?: string;
      is_self_signed?: boolean;
    } | null;
    error?: string | null;
  };
}

function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

export async function handleDomainChecks(env: Env): Promise<void> {
  const db = createDb(env.DB);
  const domainCheckerUrl = env.DOMAIN_CHECKER_URL || "http://localhost:8080";

  const httpMonitors = await db
    .select({
      id: monitor.id,
      url: monitor.url,
    })
    .from(monitor)
    .where(
      and(
        eq(monitor.type, "http"),
        or(eq(monitor.verifySSL, true), eq(monitor.checkDomain, true))
      )
    );

  if (httpMonitors.length === 0) {
    console.log("[DOMAIN-CHECK] No HTTP monitors to check");
    return;
  }

  console.log(`[DOMAIN-CHECK] Checking ${httpMonitors.length} HTTP monitors`);

  const results = [];

  for (const mon of httpMonitors) {
    if (!mon.url) {
      console.log(`[DOMAIN-CHECK] Monitor ${mon.id} has no URL, skipping`);
      continue;
    }

    try {
      const checkUrl = `${domainCheckerUrl}/check/all?url=${encodeURIComponent(mon.url)}`;
      const response = await fetch(checkUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          `[DOMAIN-CHECK] Failed to check domain for monitor ${mon.id}: ${response.status}`
        );
        continue;
      }

      const data: DomainCheckerResponse = await response.json();

      const whoisData = data.whois.data;
      const whoisError = data.whois.error || null;

      const sslData = data.ssl.data;
      const sslError = data.ssl.error || null;

      const sslExpiry = parseDate(sslData?.expiry);

      results.push({
        monitorId: mon.id,
        domain: data.domain,
        whoisCreatedDate: whoisData?.created_date || null,
        whoisUpdatedDate: whoisData?.updated_date || null,
        whoisExpirationDate: whoisData?.expiration_date || null,
        whoisRegistrar: whoisData?.registrar || null,
        whoisError,
        sslIssuer: sslData?.issuer || null,
        sslExpiry,
        sslIsSelfSigned: sslData?.is_self_signed ?? null,
        sslError,
        checkedAt: new Date(),
      });
    } catch (error) {
      console.error(
        `[DOMAIN-CHECK] Error checking domain for monitor ${mon.id}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      continue;
    }
  }

  if (results.length === 0) {
    console.log("[DOMAIN-CHECK] No results to store");
    return;
  }

  await db.insert(domainCheckResult).values(results);

  console.log(`[DOMAIN-CHECK] Stored ${results.length} domain check results`);
}
