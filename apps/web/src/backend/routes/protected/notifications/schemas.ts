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

export type EmailConfig = z.infer<typeof EmailConfigSchema>;
export type SlackConfig = z.infer<typeof SlackConfigSchema>;
export type DiscordConfig = z.infer<typeof DiscordConfigSchema>;
export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;
export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;

const NotifierConfigSchema = z
  .union([
    EmailConfigSchema,
    SlackConfigSchema,
    DiscordConfigSchema,
    WebhookConfigSchema,
    GitHubConfigSchema,
  ])
  .openapi("NotifierConfig");

export const CreateNotifierSchema = z
  .object({
    type: z.enum(["email", "slack", "discord", "webhook", "github"]),
    enabled: z.boolean().default(false),
    config: NotifierConfigSchema,
  })
  .openapi("CreateNotifier");

export const UpdateNotifierSchema = z
  .object({
    enabled: z.boolean().optional(),
    config: NotifierConfigSchema.optional(),
  })
  .openapi("UpdateNotifier");

export const NotifierResponseSchema = z
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
  ])
  .openapi("NotifierResponse");

export type CreateNotifier = z.infer<typeof CreateNotifierSchema>;
export type UpdateNotifier = z.infer<typeof UpdateNotifierSchema>;
export type NotifierResponse = z.infer<typeof NotifierResponseSchema>;
