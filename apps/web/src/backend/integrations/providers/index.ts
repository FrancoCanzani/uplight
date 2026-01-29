import type { IntegrationProvider, IntegrationType } from "../types";
import { discordProvider } from "./discord";
import { emailProvider } from "./email";
import { githubProvider } from "./github";
import { jiraProvider } from "./jira";
import { linearProvider } from "./linear";
import { opsgenieProvider } from "./opsgenie";
import { pagerdutyProvider } from "./pagerduty";
import { slackProvider } from "./slack";
import { teamsProvider } from "./teams";
import { webhookProvider } from "./webhook";

export const providers: Record<IntegrationType, IntegrationProvider> = {
  email: emailProvider,
  slack: slackProvider,
  discord: discordProvider,
  webhook: webhookProvider,
  github: githubProvider,
  pagerduty: pagerdutyProvider,
  teams: teamsProvider,
  opsgenie: opsgenieProvider,
  linear: linearProvider,
  jira: jiraProvider,
};

// Re-export config schemas for use in routes
export { EmailConfigSchema, type EmailConfig } from "./email";
export { SlackConfigSchema, type SlackConfig } from "./slack";
export { DiscordConfigSchema, type DiscordConfig } from "./discord";
export { WebhookConfigSchema, type WebhookConfig } from "./webhook";
export { GitHubConfigSchema, type GitHubConfig } from "./github";
export { PagerDutyConfigSchema, type PagerDutyConfig } from "./pagerduty";
export { TeamsConfigSchema, type TeamsConfig } from "./teams";
export { OpsgenieConfigSchema, type OpsgenieConfig } from "./opsgenie";
export { LinearConfigSchema, type LinearConfig } from "./linear";
export { JiraConfigSchema, type JiraConfig } from "./jira";
