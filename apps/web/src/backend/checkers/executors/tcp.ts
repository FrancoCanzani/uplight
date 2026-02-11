import { connect } from "cloudflare:sockets";
import type { RawCheckResult, TcpCheckRequest } from "../types";

export async function performTcpCheck(
  request: TcpCheckRequest,
  timeout: number,
): Promise<RawCheckResult> {
  const startTime = performance.now();
  let socket: ReturnType<typeof connect> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    socket = connect({
      hostname: request.host,
      port: request.port,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        socket?.close();
        reject(new Error(`TCP connection timed out after ${timeout}ms`));
      }, timeout);
    });

    await Promise.race([socket.opened, timeoutPromise]);
    const connectTime = Math.round(performance.now() - startTime);

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
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    socket?.close();
  }
}
