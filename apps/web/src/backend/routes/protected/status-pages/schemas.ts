import { z } from "@hono/zod-openapi";

export const CreateStatusPageSchema = z
  .object({
    name: z.string().min(1).max(50).openapi({ example: "Production Status" }),
    slug: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
      .openapi({ example: "production-status" }),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().default(true),
    showHistoricalUptime: z.boolean().default(true),
  })
  .openapi("CreateStatusPage");

export const UpdateStatusPageSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    description: z.string().max(500).nullable().optional(),
    isPublic: z.boolean().optional(),
    showHistoricalUptime: z.boolean().optional(),
  })
  .openapi("UpdateStatusPage");

export const StatusPageResponseSchema = z
  .object({
    id: z.number().int(),
    teamId: z.number().int(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    logoKey: z.string().nullable(),
    isPublic: z.boolean(),
    showHistoricalUptime: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("StatusPageResponse");

export const CreateGroupSchema = z
  .object({
    label: z.string().min(1).max(30).openapi({ example: "API" }),
    displayOrder: z.number().int().default(0),
  })
  .openapi("CreateGroup");

export const UpdateGroupSchema = z
  .object({
    label: z.string().min(1).max(30).optional(),
    displayOrder: z.number().int().optional(),
  })
  .openapi("UpdateGroup");

export const GroupResponseSchema = z
  .object({
    id: z.number().int(),
    statusPageId: z.number().int(),
    label: z.string(),
    displayOrder: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("GroupResponse");

export const AddMonitorSchema = z
  .object({
    monitorId: z.number().int(),
    groupId: z.number().int().nullable().optional(),
    displayOrder: z.number().int().default(0),
    displayName: z.string().max(50).nullable().optional(),
  })
  .openapi("AddMonitor");

export const UpdateMonitorSchema = z
  .object({
    groupId: z.number().int().nullable().optional(),
    displayOrder: z.number().int().optional(),
    displayName: z.string().max(50).nullable().optional(),
  })
  .openapi("UpdateMonitor");

export const StatusPageMonitorResponseSchema = z
  .object({
    statusPageId: z.number().int(),
    monitorId: z.number().int(),
    groupId: z.number().int().nullable(),
    displayOrder: z.number().int(),
    displayName: z.string().nullable(),
    createdAt: z.string(),
  })
  .openapi("StatusPageMonitorResponse");

export const SubscribeSchema = z
  .object({
    email: z.string().email(),
  })
  .openapi("Subscribe");

export const SubscriberResponseSchema = z
  .object({
    id: z.number().int(),
    statusPageId: z.number().int(),
    email: z.string(),
    isVerified: z.boolean(),
    subscribedAt: z.string(),
  })
  .openapi("SubscriberResponse");
