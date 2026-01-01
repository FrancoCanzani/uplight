import { eq, and, ne } from "drizzle-orm";
import { createDb } from "../../db";
import { incident } from "../../db/schema";
import type { CheckResult, IncidentCause } from "../types";

export interface IncidentEvent {
  type: "created" | "resolved";
  incidentId: number;
  cause: IncidentCause;
  duration?: number;
}

export async function manageIncidents(
  monitorId: number,
  results: CheckResult[],
  env: Env
): Promise<IncidentEvent[]> {
  const db = createDb(env.DB);
  const events: IncidentEvent[] = [];
  const now = Date.now();

  const failedResults = results.filter(
    (r) => r.result !== "success" && r.cause
  );
  const currentCauses = new Set(
    failedResults
      .map((r) => r.cause)
      .filter((c): c is IncidentCause => c !== undefined)
  );

  const openIncidents = await db
    .select()
    .from(incident)
    .where(
      and(eq(incident.monitorId, monitorId), ne(incident.status, "resolved"))
    );

  for (const cause of currentCauses) {
    const existing = openIncidents.find((i) => i.cause === cause);

    if (!existing) {
      const [created] = await db
        .insert(incident)
        .values({
          monitorId,
          cause,
          status: "active",
          startedAt: new Date(now),
        })
        .returning({ id: incident.id });

      events.push({
        type: "created",
        incidentId: created.id,
        cause,
      });
    }
  }

  for (const openIncident of openIncidents) {
    if (!currentCauses.has(openIncident.cause as IncidentCause)) {
      await db
        .update(incident)
        .set({
          status: "resolved",
          resolvedAt: new Date(now),
        })
        .where(eq(incident.id, openIncident.id));

      const duration = now - openIncident.startedAt.getTime();

      events.push({
        type: "resolved",
        incidentId: openIncident.id,
        cause: openIncident.cause as IncidentCause,
        duration,
      });
    }
  }

  return events;
}
