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
  repository: z.string().regex(/^[\w\-\.]+\/[\w\-\.]+$/, {
    message: "Repository must be in format 'owner/repo'",
  }),
  token: z.string().min(1, "GitHub token is required"),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
});

export type EmailConfig = z.infer<typeof EmailConfigSchema>;
export type SlackConfig = z.infer<typeof SlackConfigSchema>;
export type DiscordConfig = z.infer<typeof DiscordConfigSchema>;
export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;
export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;

export type NotifierType = "email" | "slack" | "discord" | "webhook" | "github";

export const NotifierSchema = z.discriminatedUnion("type", [
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
]);

export const CreateNotifierSchema = z.object({
  type: z.enum(["email", "slack", "discord", "webhook", "github"]),
  enabled: z.boolean().default(false),
  config: z.union([
    EmailConfigSchema,
    SlackConfigSchema,
    DiscordConfigSchema,
    WebhookConfigSchema,
    GitHubConfigSchema,
  ]),
});

export const UpdateNotifierSchema = z.object({
  enabled: z.boolean().optional(),
  config: z
    .union([
      EmailConfigSchema,
      SlackConfigSchema,
      DiscordConfigSchema,
      WebhookConfigSchema,
      GitHubConfigSchema,
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
  repository: z.string().regex(/^[\w\-\.]+\/[\w\-\.]+$/, {
    message: "Repository must be in format 'owner/repo'",
  }),
  token: z.string().min(1, "GitHub token is required"),
  labels: z.string().optional(), // Comma-separated
  assignees: z.string().optional(), // Comma-separated
});

export type Notifier = z.infer<typeof NotifierSchema>;
export type CreateNotifier = z.infer<typeof CreateNotifierSchema>;
export type UpdateNotifier = z.infer<typeof UpdateNotifierSchema>;
export type EmailFormInput = z.infer<typeof EmailFormSchema>;
export type SlackFormInput = z.infer<typeof SlackFormSchema>;
export type DiscordFormInput = z.infer<typeof DiscordFormSchema>;
export type WebhookFormInput = z.infer<typeof WebhookFormSchema>;
export type GitHubFormInput = z.infer<typeof GitHubFormSchema>;
