import { eq } from "drizzle-orm";
import { createDb } from "../db";
import { incident } from "../db/schema";
import type { IncidentEvent } from "../checkers/incidents/manager";
import type { CheckResult } from "../checkers/types";
import type { IntegrationMessage } from "./types";

interface IncidentData {
  title: string | null;
  description: string | null;
  hint: string | null;
  severity: "low" | "medium" | "high" | "critical" | null;
  cause: string;
}

async function getIncidentData(
  incidentId: number,
  env: Env,
): Promise<IncidentData> {
  const db = createDb(env.DB);
  const [incidentData] = await db
    .select({
      title: incident.title,
      description: incident.description,
      hint: incident.hint,
      severity: incident.severity,
      cause: incident.cause,
    })
    .from(incident)
    .where(eq(incident.id, incidentId))
    .limit(1);

  if (!incidentData) {
    return {
      title: null,
      description: null,
      hint: null,
      severity: null,
      cause: "",
    };
  }

  return {
    title: incidentData.title,
    description: incidentData.description,
    hint: incidentData.hint,
    severity:
      incidentData.severity === "low" ||
      incidentData.severity === "medium" ||
      incidentData.severity === "high" ||
      incidentData.severity === "critical"
        ? incidentData.severity
        : null,
    cause: incidentData.cause,
  };
}

export async function buildAlertMessage(
  event: IncidentEvent,
  monitorId: number,
  monitorName: string,
  teamId: number,
  results: CheckResult[],
  env: Env,
): Promise<IntegrationMessage> {
  const incidentData = await getIncidentData(event.incidentId, env);

  const failedLocations = results
    .filter((r) => r.result !== "success")
    .map((r) => r.location);

  const firstError = results.find(
    (r) => r.result !== "success",
  )?.errorMessage;

  return {
    type: "alert",
    monitorId,
    monitorName,
    teamId,
    incidentId: event.incidentId,
    title: incidentData.title || `Monitor DOWN: ${monitorName}`,
    description:
      incidentData.description || `Monitor "${monitorName}" is currently down.`,
    cause: incidentData.cause || event.cause,
    severity: incidentData.severity,
    hint: incidentData.hint,
    locations: failedLocations,
    errorMessage: firstError || null,
    timestamp: new Date().toISOString(),
  };
}

export async function buildRecoveryMessage(
  event: IncidentEvent,
  monitorId: number,
  monitorName: string,
  teamId: number,
  env: Env,
): Promise<IntegrationMessage> {
  const incidentData = await getIncidentData(event.incidentId, env);

  return {
    type: "recovery",
    monitorId,
    monitorName,
    teamId,
    incidentId: event.incidentId,
    title: `Monitor RECOVERED: ${monitorName}`,
    description: `Monitor "${monitorName}" is back UP.`,
    cause: incidentData.cause || event.cause,
    severity: incidentData.severity,
    hint: null,
    locations: [],
    errorMessage: null,
    duration: event.duration,
    timestamp: new Date().toISOString(),
  };
}
