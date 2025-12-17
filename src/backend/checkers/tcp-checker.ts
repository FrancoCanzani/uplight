import { connect } from "cloudflare:sockets";
import type { TcpCheckRequest, RawCheckResult } from "./types";

export async function performTcpCheck(
  request: TcpCheckRequest,
  timeout: number
): Promise<RawCheckResult> {
  const startTime = performance.now();

  try {
    const socket = connect({
      hostname: request.host,
      port: request.port,
    });

    await socket.opened;
    const connectTime = Math.round(performance.now() - startTime);

    if (connectTime > timeout) {
      socket.close();
      return {
        result: "timeout",
        responseTime: connectTime,
        errorMessage: `Connection took ${connectTime}ms, exceeding timeout of ${timeout}ms`,
        cause: "timeout",
      };
    }

    socket.close();

    return {
      result: "success",
      responseTime: connectTime,
    };
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();

      if (msg.includes("timed out") || msg.includes("etimedout")) {
        return {
          result: "timeout",
          responseTime,
          errorMessage: `TCP connection timed out: ${error.message}`,
          cause: "timeout",
        };
      }

      if (msg.includes("refused") || msg.includes("econnrefused")) {
        return {
          result: "error",
          responseTime,
          errorMessage: `Connection refused: ${error.message}`,
          cause: "connection_refused",
        };
      }

      return {
        result: "error",
        responseTime,
        errorMessage: error.message,
        cause: "tcp_failure",
      };
    }

    return {
      result: "error",
      responseTime,
      errorMessage: "Unknown TCP error",
      cause: "tcp_failure",
    };
  }
}
