import { and, ne } from "drizzle-orm";
import { createDb } from "../db";
import { monitor } from "../db/schema";
import { dispatchChecks } from "./dispatcher";
import { processResults } from "./result-processor";

export async function handleScheduled(env: Env): Promise<void> {
  const db = createDb(env.DB);
  const now = Date.now();

  const allMonitors = await db
    .select()
    .from(monitor)
    .where(
      and(ne(monitor.status, "paused"), ne(monitor.status, "maintenance"))
    );

  const monitorsToCheck = allMonitors.filter((m) => {
    const lastCheck = m.updatedAt?.getTime() ?? 0;
    const nextCheck = lastCheck + m.interval;
    return now >= nextCheck;
  });

  if (monitorsToCheck.length === 0) {
    return;
  }

  console.log(`[CRON] Checking ${monitorsToCheck.length} monitors`);

  const results = await dispatchChecks(monitorsToCheck, env);

  await processResults(results, env);

  console.log(`[CRON] Processed ${results.length} check results`);
}
