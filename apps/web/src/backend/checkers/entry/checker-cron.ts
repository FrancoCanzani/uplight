import { eq, ne, lte, gt, and } from "drizzle-orm";
import { createDb } from "../../db";
import { monitor, maintenance, checkResult } from "../../db/schema";
import { dispatchChecks } from "../dispatch/dispatcher";
import { processResults } from "../processing/result-processor";
import type { Location } from "../types";

export async function handleMonitorChecks(env: Env): Promise<void> {
  const db = createDb(env.DB);
  const now = Date.now();
  const nowDate = new Date(now);

  const allMonitors = await db
    .select()
    .from(monitor)
    .where(ne(monitor.status, "paused"));

  const activeMaintenances = await db
    .select()
    .from(maintenance)
    .where(
      and(lte(maintenance.startsAt, nowDate), gt(maintenance.endsAt, nowDate))
    );

  const maintenanceByMonitor = new Map<number, boolean>();
  for (const m of activeMaintenances) {
    maintenanceByMonitor.set(m.monitorId, true);
  }

  const monitorsInMaintenance: typeof allMonitors = [];
  const monitorsToCheck: typeof allMonitors = [];
  const monitorsExitingMaintenance: typeof allMonitors = [];

  for (const mon of allMonitors) {
    const hasActiveMaintenance = maintenanceByMonitor.has(mon.id);

    if (hasActiveMaintenance) {
      monitorsInMaintenance.push(mon);
    } else if (mon.status === "maintenance") {
      monitorsExitingMaintenance.push(mon);
    } else if (mon.status === "initializing") {
      // Monitors with "initializing" status should be checked immediately
      monitorsToCheck.push(mon);
    } else {
      const lastCheck = mon.updatedAt?.getTime() ?? 0;
      const nextCheck = lastCheck + mon.interval;
      if (now >= nextCheck) {
        monitorsToCheck.push(mon);
      }
    }
  }

  for (const mon of monitorsInMaintenance) {
    if (mon.status !== "maintenance") {
      await db
        .update(monitor)
        .set({ status: "maintenance" })
        .where(eq(monitor.id, mon.id));
    }

    const locations: Location[] = JSON.parse(mon.locations);
    const maintenanceResults = locations.map((location) => ({
      monitorId: mon.id,
      location,
      result: "maintenance" as const,
      responseTime: 0,
      retryCount: 0,
      checkedAt: nowDate,
    }));

    await db.insert(checkResult).values(maintenanceResults);
  }

  for (const mon of monitorsExitingMaintenance) {
    await db
      .update(monitor)
      .set({ status: "initializing" })
      .where(eq(monitor.id, mon.id));
    console.log(`[CRON] Maintenance ended for monitor: ${mon.name}`);
    // Add to check queue immediately after exiting maintenance
    monitorsToCheck.push(mon);
  }

  if (monitorsToCheck.length === 0) {
    if (monitorsInMaintenance.length > 0) {
      console.log(
        `[CRON] ${monitorsInMaintenance.length} monitors in maintenance`
      );
    }
    return;
  }

  console.log(`[CRON] Checking ${monitorsToCheck.length} monitors`);

  const results = await dispatchChecks(monitorsToCheck, env);

  await processResults(results, env);

  console.log(`[CRON] Processed ${results.length} check results`);
}
