import { OpenAPIHono } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { createDb } from "../../db";
import { heartbeat, heartbeatIncident, heartbeatPing } from "../../db/schema";
import type { AppEnv } from "../../types";

const ALLOWED_METHODS = ["GET", "POST", "HEAD", "PUT"] as const;
type AllowedMethod = (typeof ALLOWED_METHODS)[number];

async function handlePing(
  c: Parameters<Parameters<OpenAPIHono<AppEnv>["get"]>[1]>[0],
  method: AllowedMethod,
) {
  const { slug } = c.req.param();

  const db = createDb(c.env.DB);
  const now = Date.now();

  const [hb] = await db
    .select()
    .from(heartbeat)
    .where(eq(heartbeat.slug, slug));

  if (!hb) {
    return c.text("Not found", 404);
  }

  if (hb.status === "paused") {
    return c.text("OK", 200);
  }

  const wasDown = hb.status === "down";
  const userAgent = c.req.header("user-agent") ?? null;
  const ip =
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;

  await db
    .update(heartbeat)
    .set({
      lastPingAt: new Date(now),
      status: "up",
    })
    .where(eq(heartbeat.id, hb.id));

  await db.insert(heartbeatPing).values({
    heartbeatId: hb.id,
    method,
    userAgent,
    ip,
    pingedAt: new Date(now),
  });

  if (wasDown) {
    await db
      .update(heartbeatIncident)
      .set({
        status: "resolved",
        resolvedAt: new Date(now),
      })
      .where(
        and(
          eq(heartbeatIncident.heartbeatId, hb.id),
          eq(heartbeatIncident.status, "ongoing"),
        ),
      );
  }

  return c.text("OK", 200);
}

export function registerHeartbeat(api: OpenAPIHono<AppEnv>) {
  api.get("/ping/:slug", (c) => handlePing(c, "GET"));
  api.post("/ping/:slug", (c) => handlePing(c, "POST"));
  api.on("HEAD", "/ping/:slug", (c) => handlePing(c, "HEAD"));
  api.put("/ping/:slug", (c) => handlePing(c, "PUT"));

  return api;
}
