import { and, eq, gt, notInArray } from "drizzle-orm";
import { createDb } from "../../db";
import { incident } from "../../db/schema";
import type { CheckResult, IncidentCause } from "../types";
import { parseIncidentWithAI } from "./ai-parser";

const CONSOLIDATION_WINDOW_MS = 5 * 60 * 1000;

export interface IncidentEvent {
  type: "created" | "resolved";
  incidentId: number;
  cause: IncidentCause;
  duration?: number;
}

interface MonitorContext {
  name: string;
  url?: string;
}

async function enrichIncidentWithAI(
  incidentId: number,
  cause: IncidentCause,
  monitorCtx: MonitorContext,
  failedResult: CheckResult | undefined,
  env: Env,
): Promise<void> {
  try {
    const aiParsed = await parseIncidentWithAI(
      {
        cause,
        monitorName: monitorCtx.name,
        monitorUrl: monitorCtx.url,
        statusCode: failedResult?.statusCode,
        errorMessage: failedResult?.errorMessage,
        responseTime: failedResult?.responseTime,
        location: failedResult?.location,
        responseBody: failedResult?.responseBody,
      },
      env,
    );

    const db = createDb(env.DB);
    await db
      .update(incident)
      .set({
        title: aiParsed.title,
        description: aiParsed.description,
        hint: aiParsed.hint,
        severity: aiParsed.severity,
      })
      .where(eq(incident.id, incidentId));
  } catch (err) {
    console.error("[AI] Incident enrichment failed:", err);
  }
}

export async function manageIncidents(
  monitorId: number,
  results: CheckResult[],
  monitorCtx: MonitorContext,
  env: Env,
): Promise<IncidentEvent[]> {
  const db = createDb(env.DB);
  const events: IncidentEvent[] = [];
  const now = Date.now();

  const failedResults = results.filter(
    (r) => r.result !== "success" && r.cause,
  );
  const currentCauses = new Set(
    failedResults
      .map((r) => r.cause)
      .filter((c): c is IncidentCause => c !== undefined),
  );

  const openIncidents = await db
    .select()
    .from(incident)
    .where(
      and(
        eq(incident.monitorId, monitorId),
        notInArray(incident.status, ["resolved", "recovered"]),
      ),
    );

  for (const cause of currentCauses) {
    const existing = openIncidents.find((i) => i.cause === cause);

    if (!existing) {
      const [recentIncident] = await db
        .select({ id: incident.id })
        .from(incident)
        .where(
          and(
            eq(incident.monitorId, monitorId),
            eq(incident.cause, cause),
            gt(incident.startedAt, new Date(now - CONSOLIDATION_WINDOW_MS)),
          ),
        )
        .limit(1);

      if (recentIncident) {
        continue;
      }

      const failedResult = failedResults.find((r) => r.cause === cause);

      const [created] = await db
        .insert(incident)
        .values({
          monitorId,
          cause,
          status: "ongoing",
          startedAt: new Date(now),
          title: null,
          description: null,
          hint: null,
          severity: null,
        })
        .returning({ id: incident.id });

      void enrichIncidentWithAI(created.id, cause, monitorCtx, failedResult, env);

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
          status: "recovered",
          recoveredAt: new Date(now),
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
