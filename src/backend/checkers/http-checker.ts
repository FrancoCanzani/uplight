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
  let response: Response | null = null;
  let responseHeaders: Record<string, string> | undefined;
  let responseBody: string | undefined;

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

    response = await fetch(request.url, fetchOptions);
    const responseTime = Math.round(performance.now() - startTime);
    responseHeaders = headersToRecord(response.headers);

    if (!request.expectedStatusCodes.includes(response.status)) {
      try {
        const bodyText = await response.text();
        responseBody = truncate(bodyText, BODY_TRUNCATE);
      } catch {
        responseBody = undefined;
      }
      return {
        result: "failure",
        responseTime,
        statusCode: response.status,
        errorMessage: `Expected status ${request.expectedStatusCodes.join(", ")}, got ${response.status}`,
        cause: getCauseFromStatus(response.status),
        responseHeaders,
        responseBody,
      };
    }

    if (request.contentCheck?.enabled) {
      try {
        const bodyText = await response.text();
        const limitedBody = bodyText.slice(0, MAX_BODY_SIZE);
        const contains = limitedBody.includes(request.contentCheck.content);
        const shouldContain = request.contentCheck.mode === "contains";

        if (contains !== shouldContain) {
          return {
            result: "failure",
            responseTime,
            statusCode: response.status,
            errorMessage: `Content check failed: ${request.contentCheck.mode} "${request.contentCheck.content}"`,
            cause: "content_mismatch",
            responseHeaders,
            responseBody: truncate(limitedBody, BODY_TRUNCATE),
          };
        }
      } catch (bodyError) {
        return {
          result: "error",
          responseTime,
          statusCode: response.status,
          errorMessage: `Failed to read response body: ${bodyError instanceof Error ? bodyError.message : "Unknown error"}`,
          cause: "content_mismatch",
          responseHeaders,
        };
      }
    }

    return {
      result: "success",
      responseTime,
      statusCode: response.status,
    };
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);

    if (response && responseHeaders && !responseBody) {
      try {
        const bodyText = await response.text();
        responseBody = truncate(bodyText, BODY_TRUNCATE);
      } catch {
        // Body reading failed, but we still have headers
      }
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          result: "timeout",
          responseTime,
          errorMessage: `Request timed out after ${timeout}ms`,
          cause: "timeout",
          ...(responseHeaders && { responseHeaders }),
          ...(responseBody && { responseBody }),
        };
      }

      if (isSslError(error)) {
        const sslNote = request.verifySSL
          ? ""
          : " (note: Workers cannot bypass SSL checks)";
        return {
          result: "error",
          responseTime,
          errorMessage: `SSL error: ${error.message}${sslNote}`,
          cause: "ssl_error",
          ...(responseHeaders && { responseHeaders }),
          ...(responseBody && { responseBody }),
        };
      }

      if (error.message.includes("ECONNREFUSED")) {
        return {
          result: "error",
          responseTime,
          errorMessage: `Connection refused: ${error.message}`,
          cause: "connection_refused",
          ...(responseHeaders && { responseHeaders }),
          ...(responseBody && { responseBody }),
        };
      }

      return {
        result: "error",
        responseTime,
        errorMessage: error.message,
        ...(responseHeaders && { responseHeaders }),
        ...(responseBody && { responseBody }),
      };
    }

    return {
      result: "error",
      responseTime,
      errorMessage: "Unknown error",
      ...(responseHeaders && { responseHeaders }),
      ...(responseBody && { responseBody }),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
