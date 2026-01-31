import type { z } from "@hono/zod-openapi";
import type { IncidentEvent } from "../checkers/incidents/manager";
import type { CheckResult } from "../checkers/types";

export type IntegrationType =
  | "email"
  | "slack"
  | "discord"
  | "webhook"
  | "github"
  | "pagerduty"
  | "teams"
  | "opsgenie"
  | "linear"
  | "jira"
  | "sms";

export interface IntegrationProvider<TConfig = unknown> {
  type: IntegrationType;
  configSchema: z.ZodSchema<TConfig>;
  send(config: TConfig, message: IntegrationMessage, env: Env): Promise<void>;
}

export interface IntegrationMessage {
  type: "alert" | "recovery";
  monitorId: number;
  monitorName: string;
  teamId: number;
  incidentId: number;
  title: string;
  description: string;
  cause: string;
  severity: "low" | "medium" | "high" | "critical" | null;
  hint: string | null;
  locations: string[];
  errorMessage: string | null;
  duration?: number;
  timestamp: string;
}

export interface IntegrationContext {
  monitorId: number;
  monitorName: string;
  teamId: number;
  oldStatus: string;
  newStatus: string;
  results: CheckResult[];
  incidentEvents: IncidentEvent[];
  env: Env;
}

export interface QueueMessage {
  integrationId: number;
  integrationType: IntegrationType;
  config: string;
  message: IntegrationMessage;
}
