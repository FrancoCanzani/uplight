import { DurableObject } from "cloudflare:workers";
import { performHttpCheck } from "../executors/http-checker";
import { performTcpCheck } from "../executors/tcp-checker";
import { checkDns } from "../executors/dns-checker";
import { withRetry } from "../utils/retry";
import { extractHostname } from "../../lib/utils";
import type { CheckRequest, CheckResult, CheckConfig } from "../types";

export class CheckerDO extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const checkRequest: CheckRequest = await request.json();
      const result = await this.performCheck(checkRequest);
      return Response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  private async performCheck(request: CheckRequest): Promise<CheckResult> {
    const startTime = Date.now();
    const timeoutMs = request.timeout * 1000;

    if (request.checkDNS) {
      const hostname =
        request.type === "http" ? extractHostname(request.url) : request.host;

      const dnsOk = await checkDns(hostname);
      if (!dnsOk) {
        return {
          monitorId: request.monitorId,
          location: request.location,
          result: "error",
          responseTime: Math.round(performance.now() - startTime),
          errorMessage: `DNS resolution failed for ${hostname}`,
          cause: "dns_failure",
          retryCount: 0,
          checkedAt: Date.now(),
        };
      }
    }

    const config: CheckConfig = {
      timeout: timeoutMs,
      maxRetries: 3,
      initialRetryDelay: 1000,
    };

    const checkFn =
      request.type === "http"
        ? () => performHttpCheck(request, timeoutMs)
        : () => performTcpCheck(request, timeoutMs);

    const result = await withRetry(checkFn, config);

    return {
      monitorId: request.monitorId,
      location: request.location,
      ...result,
      checkedAt: Date.now(),
    };
  }
}
