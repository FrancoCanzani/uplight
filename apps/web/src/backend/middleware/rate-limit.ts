import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../types";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (c: Context<AppEnv>) => string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (per isolate - good enough for basic protection)
// Expired entries are handled lazily when accessed
const store = new Map<string, RateLimitEntry>();

function getClientIP(c: Context<AppEnv>): string {
  return (
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "unknown"
  );
}

export function rateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config;

  return async (c: Context<AppEnv>, next: Next) => {
    const key = keyGenerator ? keyGenerator(c) : getClientIP(c);
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      // Create new entry
      entry = {
        count: 1,
        resetAt: now + windowMs,
      };
      store.set(key, entry);
    } else {
      entry.count++;
    }

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    c.header("X-RateLimit-Limit", maxRequests.toString());
    c.header("X-RateLimit-Remaining", remaining.toString());
    c.header("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000).toString());

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header("Retry-After", retryAfter.toString());
      throw new HTTPException(429, {
        message: "Too many requests. Please try again later.",
      });
    }

    await next();
  };
}

// Pre-configured rate limiters for different use cases
export const publicApiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export const heartbeatRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 120, // 120 pings per minute (allows 2 per second)
});

export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 attempts per 15 minutes
});

export const statusPageRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
});
