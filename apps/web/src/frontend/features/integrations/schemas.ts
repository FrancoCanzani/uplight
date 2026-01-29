import { z } from "zod";

export const EmailConfigSchema = z.object({});

export const SlackConfigSchema = z.object({
  webhookUrl: z.url("Invalid webhook URL"),
  channel: z.string().optional(),
  username: z.string().optional(),
});

export const DiscordConfigSchema = z.object({
  webhookUrl: z.url("Invalid webhook URL"),
  username: z.string().optional(),
  avatarUrl: z.union([z.url("Invalid avatar URL"), z.literal("")]).optional(),
});

export const WebhookConfigSchema = z.object({
  url: z.url("Invalid webhook URL"),
  method: z.enum(["POST", "PUT", "PATCH"]),
});

export const GitHubConfigSchema = z.object({
  repository: z.string().regex(/^[\w\-.]+\/[\w\-.]+$/, {
    message: "Repository must be in format 'owner/repo'",
  }),
  token: z.string().min(1, "GitHub token is required"),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
});

export const PagerDutyConfigSchema = z.object({
  routingKey: z.string().min(1, "Routing key is required"),
  severity: z.enum(["critical", "error", "warning", "info"]),
});

export const TeamsConfigSchema = z.object({
  webhookUrl: z.url("Invalid webhook URL"),
});

export const OpsgenieConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  region: z.enum(["us", "eu"]),
  priority: z.enum(["P1", "P2", "P3", "P4", "P5"]),
});

export const LinearConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  teamId: z.string().min(1, "Team ID is required"),
  labelIds: z.array(z.string()).optional(),
});

export const JiraConfigSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  email: z.string().email("Invalid email"),
  apiToken: z.string().min(1, "API token is required"),
  projectKey: z.string().min(1, "Project key is required"),
  issueType: z.string(),
});

export type EmailConfig = z.infer<typeof EmailConfigSchema>;
export type SlackConfig = z.infer<typeof SlackConfigSchema>;
export type DiscordConfig = z.infer<typeof DiscordConfigSchema>;
export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;
export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;
export type PagerDutyConfig = z.infer<typeof PagerDutyConfigSchema>;
export type TeamsConfig = z.infer<typeof TeamsConfigSchema>;
export type OpsgenieConfig = z.infer<typeof OpsgenieConfigSchema>;
export type LinearConfig = z.infer<typeof LinearConfigSchema>;
export type JiraConfig = z.infer<typeof JiraConfigSchema>;

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
  | "jira";

export const IntegrationSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.number(),
    teamId: z.number(),
    type: z.literal("email"),
    enabled: z.boolean(),
    config: EmailConfigSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
  z.object({
    id: z.number(),
    teamId: z.number(),
    type: z.literal("slack"),
    enabled: z.boolean(),
    config: SlackConfigSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
  z.object({
    id: z.number(),
    teamId: z.number(),
    type: z.literal("discord"),
    enabled: z.boolean(),
    config: DiscordConfigSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
  z.object({
    id: z.number(),
    teamId: z.number(),
    type: z.literal("webhook"),
    enabled: z.boolean(),
    config: WebhookConfigSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
  z.object({
    id: z.number(),
    teamId: z.number(),
    type: z.literal("github"),
    enabled: z.boolean(),
    config: GitHubConfigSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
  z.object({
    id: z.number(),
    teamId: z.number(),
    type: z.literal("pagerduty"),
    enabled: z.boolean(),
    config: PagerDutyConfigSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
  z.object({
    id: z.number(),
    teamId: z.number(),
    type: z.literal("teams"),
    enabled: z.boolean(),
    config: TeamsConfigSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
  z.object({
    id: z.number(),
    teamId: z.number(),
    type: z.literal("opsgenie"),
    enabled: z.boolean(),
    config: OpsgenieConfigSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
  z.object({
    id: z.number(),
    teamId: z.number(),
    type: z.literal("linear"),
    enabled: z.boolean(),
    config: LinearConfigSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
  z.object({
    id: z.number(),
    teamId: z.number(),
    type: z.literal("jira"),
    enabled: z.boolean(),
    config: JiraConfigSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
]);

export const CreateIntegrationSchema = z.object({
  type: z.enum([
    "email",
    "slack",
    "discord",
    "webhook",
    "github",
    "pagerduty",
    "teams",
    "opsgenie",
    "linear",
    "jira",
  ]),
  enabled: z.boolean().default(false),
  config: z.union([
    EmailConfigSchema,
    SlackConfigSchema,
    DiscordConfigSchema,
    WebhookConfigSchema,
    GitHubConfigSchema,
    PagerDutyConfigSchema,
    TeamsConfigSchema,
    OpsgenieConfigSchema,
    LinearConfigSchema,
    JiraConfigSchema,
  ]),
});

export const UpdateIntegrationSchema = z.object({
  enabled: z.boolean().optional(),
  config: z
    .union([
      EmailConfigSchema,
      SlackConfigSchema,
      DiscordConfigSchema,
      WebhookConfigSchema,
      GitHubConfigSchema,
      PagerDutyConfigSchema,
      TeamsConfigSchema,
      OpsgenieConfigSchema,
      LinearConfigSchema,
      JiraConfigSchema,
    ])
    .optional(),
});

export const EmailFormSchema = z.object({
  type: z.literal("email"),
  enabled: z.boolean(),
});

export const SlackFormSchema = z.object({
  type: z.literal("slack"),
  enabled: z.boolean(),
  webhookUrl: z.url("Invalid webhook URL"),
  channel: z.string().optional(),
  username: z.string().optional(),
});

export const DiscordFormSchema = z.object({
  type: z.literal("discord"),
  enabled: z.boolean(),
  webhookUrl: z.url("Invalid webhook URL"),
  username: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const WebhookFormSchema = z.object({
  type: z.literal("webhook"),
  enabled: z.boolean(),
  url: z.url("Invalid webhook URL"),
  method: z.enum(["POST", "PUT", "PATCH"]),
});

export const GitHubFormSchema = z.object({
  type: z.literal("github"),
  enabled: z.boolean(),
  repository: z.string().regex(/^[\w\-.]+\/[\w\-.]+$/, {
    message: "Repository must be in format 'owner/repo'",
  }),
  token: z.string().min(1, "GitHub token is required"),
  labels: z.string().optional(), // Comma-separated
  assignees: z.string().optional(), // Comma-separated
});

export const PagerDutyFormSchema = z.object({
  type: z.literal("pagerduty"),
  enabled: z.boolean(),
  routingKey: z.string().min(1, "Routing key is required"),
  severity: z.enum(["critical", "error", "warning", "info"]),
});

export const TeamsFormSchema = z.object({
  type: z.literal("teams"),
  enabled: z.boolean(),
  webhookUrl: z.url("Invalid webhook URL"),
});

export const OpsgenieFormSchema = z.object({
  type: z.literal("opsgenie"),
  enabled: z.boolean(),
  apiKey: z.string().min(1, "API key is required"),
  region: z.enum(["us", "eu"]),
  priority: z.enum(["P1", "P2", "P3", "P4", "P5"]),
});

export const LinearFormSchema = z.object({
  type: z.literal("linear"),
  enabled: z.boolean(),
  apiKey: z.string().min(1, "API key is required"),
  teamId: z.string().min(1, "Team ID is required"),
  labelIds: z.string().optional(), // Comma-separated
});

export const JiraFormSchema = z.object({
  type: z.literal("jira"),
  enabled: z.boolean(),
  domain: z.string().min(1, "Domain is required"),
  email: z.string().email("Invalid email"),
  apiToken: z.string().min(1, "API token is required"),
  projectKey: z.string().min(1, "Project key is required"),
  issueType: z.string().min(1, "Issue type is required"),
});

export type Integration = z.infer<typeof IntegrationSchema>;
export type CreateIntegration = z.infer<typeof CreateIntegrationSchema>;
export type UpdateIntegration = z.infer<typeof UpdateIntegrationSchema>;
export type EmailFormInput = z.infer<typeof EmailFormSchema>;
export type SlackFormInput = z.infer<typeof SlackFormSchema>;
export type DiscordFormInput = z.infer<typeof DiscordFormSchema>;
export type WebhookFormInput = z.infer<typeof WebhookFormSchema>;
export type GitHubFormInput = z.infer<typeof GitHubFormSchema>;
export type PagerDutyFormInput = z.infer<typeof PagerDutyFormSchema>;
export type TeamsFormInput = z.infer<typeof TeamsFormSchema>;
export type OpsgenieFormInput = z.infer<typeof OpsgenieFormSchema>;
export type LinearFormInput = z.infer<typeof LinearFormSchema>;
export type JiraFormInput = z.infer<typeof JiraFormSchema>;
