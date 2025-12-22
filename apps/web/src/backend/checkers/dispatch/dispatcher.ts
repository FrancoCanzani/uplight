import type { CheckRequest, CheckResult, Location, MonitorRow } from "../types";

const LOCATION_HINTS: Record<Location, DurableObjectLocationHint> = {
  wnam: "wnam",
  enam: "enam",
  sam: "sam",
  weur: "weur",
  eeur: "eeur",
  apac: "apac",
  oc: "oc",
  afr: "afr",
  me: "me",
};

function buildCheckRequest(mon: MonitorRow, location: Location): CheckRequest {
  const base = {
    monitorId: mon.id,
    location,
    timeout: mon.timeout,
    checkDNS: mon.checkDNS,
    contentCheck: mon.contentCheck ? JSON.parse(mon.contentCheck) : undefined,
  };

  if (mon.type === "http") {
    return {
      ...base,
      type: "http",
      url: mon.url!,
      method: mon.method ?? "get",
      headers: mon.headers ? JSON.parse(mon.headers) : undefined,
      body: mon.body ?? undefined,
      username: mon.username ?? undefined,
      password: mon.password ?? undefined,
      expectedStatusCodes: mon.expectedStatusCodes
        ? JSON.parse(mon.expectedStatusCodes)
        : [200],
      followRedirects: mon.followRedirects,
      verifySSL: mon.verifySSL,
    };
  }

  return {
    ...base,
    type: "tcp",
    host: mon.host!,
    port: mon.port!,
  };
}

async function dispatchToLocation(
  request: CheckRequest,
  location: Location,
  env: Env
): Promise<CheckResult> {
  const doId = env.CHECKER.idFromName(`checker-${location}`);
  const stub = env.CHECKER.get(doId, {
    locationHint: LOCATION_HINTS[location],
  });

  const response = await stub.fetch("https://checker.internal/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Check dispatch failed: ${response.status}`);
  }

  return response.json();
}

export async function dispatchChecks(
  monitors: MonitorRow[],
  env: Env
): Promise<CheckResult[]> {
  const promises: Promise<CheckResult>[] = [];

  for (const mon of monitors) {
    const locations: Location[] = JSON.parse(mon.locations);

    for (const location of locations) {
      const request = buildCheckRequest(mon, location);
      promises.push(
        dispatchToLocation(request, location, env).catch((error) => ({
          monitorId: mon.id,
          location,
          result: "error" as const,
          responseTime: 0,
          errorMessage:
            error instanceof Error ? error.message : "Dispatch failed",
          retryCount: 0,
          checkedAt: Date.now(),
        }))
      );
    }
  }

  return Promise.all(promises);
}
