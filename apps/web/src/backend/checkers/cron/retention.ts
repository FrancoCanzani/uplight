import { lt } from "drizzle-orm";
import { createDb } from "../../db";
import { checkResult, heartbeatPing } from "../../db/schema";

const RETENTION_DAYS = 60;

export async function handleDataRetention(env: Env): Promise<void> {
  const db = createDb(env.DB);
  const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  console.log(`[RETENTION] Cleaning up records older than ${cutoffDate.toISOString()}`);

  // Delete old check results
  const checkResultsDeleted = await db
    .delete(checkResult)
    .where(lt(checkResult.checkedAt, cutoffDate))
    .returning({ id: checkResult.id });

  console.log(`[RETENTION] Deleted ${checkResultsDeleted.length} old check results`);

  // Delete old heartbeat pings
  const heartbeatPingsDeleted = await db
    .delete(heartbeatPing)
    .where(lt(heartbeatPing.pingedAt, cutoffDate))
    .returning({ id: heartbeatPing.id });

  console.log(`[RETENTION] Deleted ${heartbeatPingsDeleted.length} old heartbeat pings`);

  console.log("[RETENTION] Data retention cleanup completed");
}
