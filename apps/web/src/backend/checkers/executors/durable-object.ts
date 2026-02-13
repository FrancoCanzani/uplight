import { DurableObject } from "cloudflare:workers";
import { extractHostname } from "../../lib/utils";
import { withRetry } from "../retry";
import type { CheckConfig, CheckRequest, CheckResult } from "../types";
import { checkDns, performDnsCheck } from "./dns";
import { performHttpCheck } from "./http";
import { performTcpCheck } from "./tcp";

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
    const timeoutMs = request.timeout * 1000;

    if (request.type !== "dns") {
      const hostname =
        request.type === "http" ? extractHostname(request.url) : request.host;
      try {
        const dnsOk = await checkDns(hostname);
        // DNS preflight is a hint only; don't hard-fail checks here because
        // resolver endpoint outages can mark every monitor as down.
        if (!dnsOk) {
          console.warn(
            `DNS preflight failed for ${hostname}, continuing with ${request.type} check`,
          );
        }
      } catch (error) {
        console.warn(
          `DNS preflight error for ${hostname}, continuing with ${request.type} check`,
          error,
        );
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
        : request.type === "tcp"
          ? () => performTcpCheck(request, timeoutMs)
          : () => performDnsCheck(request, timeoutMs);

    const result = await withRetry(checkFn, config);

    return {
      monitorId: request.monitorId,
      location: request.location,
      ...result,
      checkedAt: Date.now(),
    };
  }
}
