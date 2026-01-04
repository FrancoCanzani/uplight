import { eq, and, ne } from "drizzle-orm";
import { createDb } from "../../db";
import { incident } from "../../db/schema";
import { parseIncidentWithAI } from "../utils/parse-incident-with-ai";
import type { CheckResult, IncidentCause } from "../types";

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

export async function manageIncidents(
  monitorId: number,
  results: CheckResult[],
  monitorCtx: MonitorContext,
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
      const failedResult = failedResults.find((r) => r.cause === cause);

      let aiParsed: Awaited<ReturnType<typeof parseIncidentWithAI>> | null =
        null;
      try {
        console.log("[AI] Parsing incident for cause:", cause);
        aiParsed = await parseIncidentWithAI({
          cause,
          monitorName: monitorCtx.name,
          monitorUrl: monitorCtx.url,
          statusCode: failedResult?.statusCode,
          errorMessage: failedResult?.errorMessage,
          responseTime: failedResult?.responseTime,
          location: failedResult?.location,
        });
        console.log("[AI] Parsed result:", aiParsed);
      } catch (err) {
        console.error("[AI] Parsing failed:", err);
      }

      const [created] = await db
        .insert(incident)
        .values({
          monitorId,
          cause,
          status: "active",
          startedAt: new Date(now),
          title: aiParsed?.title ?? null,
          description: aiParsed?.description ?? null,
          hint: aiParsed?.hint ?? null,
          severity: aiParsed?.severity ?? null,
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
