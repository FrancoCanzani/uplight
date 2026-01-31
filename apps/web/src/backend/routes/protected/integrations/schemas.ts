import { z } from "@hono/zod-openapi";

export const EmailConfigSchema = z.object({}).openapi("EmailConfig");

export const SlackConfigSchema = z
  .object({
    webhookUrl: z.url(),
    channel: z.string().optional(),
    username: z.string().optional(),
  })
  .openapi("SlackConfig");

export const DiscordConfigSchema = z
  .object({
    webhookUrl: z.url(),
    username: z.string().optional(),
    avatarUrl: z.union([z.url(), z.literal("")]).optional(),
  })
  .openapi("DiscordConfig");

export const WebhookConfigSchema = z
  .object({
    url: z.url(),
    method: z.enum(["POST", "PUT", "PATCH"]).default("POST"),
  })
  .openapi("WebhookConfig");

export const GitHubConfigSchema = z
  .object({
    repository: z.string().regex(/^[\w\-.]+\/[\w\-.]+$/),
    token: z.string().min(1),
    labels: z.array(z.string()).optional(),
    assignees: z.array(z.string()).optional(),
  })
  .openapi("GitHubConfig");

export const PagerDutyConfigSchema = z
  .object({
    routingKey: z.string().min(1),
    severity: z.enum(["critical", "error", "warning", "info"]).default("error"),
  })
  .openapi("PagerDutyConfig");

export const TeamsConfigSchema = z
  .object({
    webhookUrl: z.url(),
  })
  .openapi("TeamsConfig");

export const OpsgenieConfigSchema = z
  .object({
    apiKey: z.string().min(1),
    region: z.enum(["us", "eu"]).default("us"),
    priority: z.enum(["P1", "P2", "P3", "P4", "P5"]).default("P3"),
  })
  .openapi("OpsgenieConfig");

export const LinearConfigSchema = z
  .object({
    apiKey: z.string().min(1),
    teamId: z.string().min(1),
    labelIds: z.array(z.string()).optional(),
  })
  .openapi("LinearConfig");

export const JiraConfigSchema = z
  .object({
    domain: z.string().min(1),
    email: z.string().email(),
    apiToken: z.string().min(1),
    projectKey: z.string().min(1),
    issueType: z.string().default("Bug"),
  })
  .openapi("JiraConfig");

export const SmsConfigSchema = z
  .object({
    accountSid: z.string().min(1, "Account SID is required"),
    authToken: z.string().min(1, "Auth Token is required"),
    fromNumber: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, "Must be E.164 format (+1234567890)"),
    toNumbers: z
      .array(z.string().regex(/^\+[1-9]\d{1,14}$/, "Must be E.164 format"))
      .min(1, "At least one phone number is required")
      .max(10, "Maximum 10 phone numbers allowed"),
  })
  .openapi("SmsConfig");

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
export type SmsConfig = z.infer<typeof SmsConfigSchema>;

const IntegrationConfigSchema = z
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
    SmsConfigSchema,
  ])
  .openapi("IntegrationConfig");

export const CreateIntegrationSchema = z
  .object({
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
      "sms",
    ]),
    enabled: z.boolean().default(false),
    config: IntegrationConfigSchema,
  })
  .openapi("CreateIntegration");

export const UpdateIntegrationSchema = z
  .object({
    enabled: z.boolean().optional(),
    config: IntegrationConfigSchema.optional(),
  })
  .openapi("UpdateIntegration");

export const IntegrationResponseSchema = z
  .discriminatedUnion("type", [
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("email"),
      enabled: z.boolean(),
      config: EmailConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("slack"),
      enabled: z.boolean(),
      config: SlackConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("discord"),
      enabled: z.boolean(),
      config: DiscordConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("webhook"),
      enabled: z.boolean(),
      config: WebhookConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("github"),
      enabled: z.boolean(),
      config: GitHubConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("pagerduty"),
      enabled: z.boolean(),
      config: PagerDutyConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("teams"),
      enabled: z.boolean(),
      config: TeamsConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("opsgenie"),
      enabled: z.boolean(),
      config: OpsgenieConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("linear"),
      enabled: z.boolean(),
      config: LinearConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("jira"),
      enabled: z.boolean(),
      config: JiraConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
    z.object({
      id: z.number().int(),
      teamId: z.number().int(),
      type: z.literal("sms"),
      enabled: z.boolean(),
      config: SmsConfigSchema,
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
    }),
  ])
  .openapi("IntegrationResponse");

export type CreateIntegration = z.infer<typeof CreateIntegrationSchema>;
export type UpdateIntegration = z.infer<typeof UpdateIntegrationSchema>;
export type IntegrationResponse = z.infer<typeof IntegrationResponseSchema>;
