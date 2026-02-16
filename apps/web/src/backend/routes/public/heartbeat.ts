import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { Context } from "hono";
import { createDb } from "../../db";
import { heartbeat, heartbeatIncident, heartbeatPing } from "../../db/schema";
import type { AppEnv } from "../../types";

type AllowedMethod = "GET" | "POST" | "HEAD" | "PUT";

async function handlePing(c: Context<AppEnv>, method: AllowedMethod) {
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

  const updateHeartbeat = db
    .update(heartbeat)
    .set({
      lastPingAt: new Date(now),
      status: "up",
    })
    .where(eq(heartbeat.id, hb.id));

  const insertPing = db.insert(heartbeatPing).values({
    heartbeatId: hb.id,
    method,
    userAgent,
    ip,
    pingedAt: new Date(now),
  });

  if (wasDown) {
    const resolveIncident = db
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
    await db.batch([updateHeartbeat, insertPing, resolveIncident]);
  } else {
    await db.batch([updateHeartbeat, insertPing]);
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
