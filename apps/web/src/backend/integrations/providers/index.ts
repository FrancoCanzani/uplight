import type { IntegrationProvider, IntegrationType } from "../types";
import { discordProvider } from "./discord";
import { emailProvider } from "./email";
import { githubProvider } from "./github";
import { slackProvider } from "./slack";
import { webhookProvider } from "./webhook";

export const providers: Record<IntegrationType, IntegrationProvider> = {
  email: emailProvider,
  slack: slackProvider,
  discord: discordProvider,
  webhook: webhookProvider,
  github: githubProvider,
};

// Re-export config schemas for use in routes
export { EmailConfigSchema, type EmailConfig } from "./email";
export { SlackConfigSchema, type SlackConfig } from "./slack";
export { DiscordConfigSchema, type DiscordConfig } from "./discord";
export { WebhookConfigSchema, type WebhookConfig } from "./webhook";
export { GitHubConfigSchema, type GitHubConfig } from "./github";
