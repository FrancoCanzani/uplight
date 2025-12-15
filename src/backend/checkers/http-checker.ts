import type { HttpCheckRequest, RawCheckResult, IncidentCause } from "./types";
import { truncate, headersToRecord } from "../lib/utils";

const MAX_BODY_SIZE = 1024 * 1024;
const BODY_TRUNCATE = 2048;

function getCauseFromStatus(status: number): IncidentCause {
  if (status >= 500) return "http_5xx";
  if (status >= 400) return "http_4xx";
  return "http_3xx";
}

function isSslError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes("ssl") ||
    msg.includes("certificate") ||
    msg.includes("cert") ||
    msg.includes("tls")
  );
}

export async function performHttpCheck(
  request: HttpCheckRequest,
  timeout: number
): Promise<RawCheckResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const startTime = performance.now();

  try {
    const headers = new Headers(request.headers ?? {});

    if (request.username && request.password) {
      const credentials = btoa(`${request.username}:${request.password}`);
      headers.set("Authorization", `Basic ${credentials}`);
    }

    const fetchOptions: RequestInit = {
      method: request.method.toUpperCase(),
      headers,
      signal: controller.signal,
      redirect: request.followRedirects ? "follow" : "manual",
    };

    const methodsWithBody = ["POST", "PUT", "PATCH"];
    if (
      request.body &&
      methodsWithBody.includes(request.method.toUpperCase())
    ) {
      fetchOptions.body = request.body;
    }

    const response = await fetch(request.url, fetchOptions);
    const responseTime = Math.round(performance.now() - startTime);
    const responseHeaders = headersToRecord(response.headers);

    if (!request.expectedStatusCodes.includes(response.status)) {
      const bodyText = await response.text().catch(() => "");
      return {
        status: "failure",
        responseTime,
        statusCode: response.status,
        errorMessage: `Expected status ${request.expectedStatusCodes.join(", ")}, got ${response.status}`,
        cause: getCauseFromStatus(response.status),
        responseHeaders,
        responseBody: truncate(bodyText, BODY_TRUNCATE),
      };
    }

    if (request.contentCheck?.enabled) {
      const bodyText = await response.text();
      const limitedBody = bodyText.slice(0, MAX_BODY_SIZE);
      const contains = limitedBody.includes(request.contentCheck.content);
      const shouldContain = request.contentCheck.mode === "contains";

      if (contains !== shouldContain) {
        return {
          status: "failure",
          responseTime,
          statusCode: response.status,
          errorMessage: `Content check failed: ${request.contentCheck.mode} "${request.contentCheck.content}"`,
          cause: "content_mismatch",
          responseHeaders,
          responseBody: truncate(limitedBody, BODY_TRUNCATE),
        };
      }
    }

    return {
      status: "success",
      responseTime,
      statusCode: response.status,
    };
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          status: "timeout",
          responseTime,
          errorMessage: `Request timed out after ${timeout}ms`,
          cause: "timeout",
        };
      }

      if (isSslError(error)) {
        const sslNote = request.verifySSL
          ? ""
          : " (note: Workers cannot bypass SSL checks)";
        return {
          status: "error",
          responseTime,
          errorMessage: `SSL error: ${error.message}${sslNote}`,
          cause: "ssl_error",
        };
      }

      if (error.message.includes("ECONNREFUSED")) {
        return {
          status: "error",
          responseTime,
          errorMessage: `Connection refused: ${error.message}`,
          cause: "connection_refused",
        };
      }

      return {
        status: "error",
        responseTime,
        errorMessage: error.message,
      };
    }

    return {
      status: "error",
      responseTime,
      errorMessage: "Unknown error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
