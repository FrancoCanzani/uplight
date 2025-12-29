import { eq, and, ne } from "drizzle-orm";
import { createDb } from "../../db";
import { heartbeat, heartbeatIncident } from "../../db/schema";

export async function handleHeartbeatChecks(env: Env): Promise<void> {
  const db = createDb(env.DB);
  const now = Date.now();

  const heartbeats = await db
    .select()
    .from(heartbeat)
    .where(ne(heartbeat.status, "paused"));

  for (const hb of heartbeats) {
    if (hb.status === "initializing" || !hb.lastPingAt) {
      continue;
    }

    const deadline = hb.lastPingAt.getTime() + hb.gracePeriod * 1000;
    const isLate = now > deadline;

    if (isLate && hb.status !== "down") {
      await db
        .update(heartbeat)
        .set({ status: "down" })
        .where(eq(heartbeat.id, hb.id));

      const [existingIncident] = await db
        .select()
        .from(heartbeatIncident)
        .where(
          and(
            eq(heartbeatIncident.heartbeatId, hb.id),
            eq(heartbeatIncident.status, "ongoing")
          )
        );

      if (!existingIncident) {
        await db.insert(heartbeatIncident).values({
          heartbeatId: hb.id,
          cause: "heartbeat_missed",
          status: "ongoing",
          startedAt: new Date(now),
        });
      }

      console.log(`[HEARTBEAT] ${hb.name} marked as down - missed heartbeat`);
    }
  }
}
