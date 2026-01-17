import { z } from "@hono/zod-openapi";

export const HeartbeatStatusSchema = z.enum([
  "up",
  "down",
  "paused",
  "initializing",
]);

export const CreateHeartbeatSchema = z
  .object({
    name: z.string().min(1).max(50).openapi({ example: "Daily Backup Job" }),
    period: z
      .number()
      .int()
      .min(60)
      .max(2592000)
      .openapi({
        example: 86400,
        description: "Expected interval between pings in seconds",
      }),
    gracePeriod: z
      .number()
      .int()
      .min(60)
      .max(86400)
      .openapi({ example: 300, description: "Grace period in seconds" }),
  })
  .openapi("CreateHeartbeat");

export const UpdateHeartbeatSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    period: z.number().int().min(60).max(2592000).optional(),
    gracePeriod: z.number().int().min(60).max(86400).optional(),
  })
  .openapi("UpdateHeartbeat");

export const RecentPingSchema = z.object({
  id: z.number().int(),
  method: z.enum(["GET", "POST", "HEAD", "PUT"]),
  userAgent: z.string().nullable(),
  ip: z.string().nullable(),
  pingedAt: z.number().int(),
});

export const HeartbeatResponseSchema = z
  .object({
    id: z.number().int().openapi({ example: 1 }),
    teamId: z.number().int(),
    type: z.literal("heartbeat"),
    name: z.string(),
    slug: z.string(),
    period: z.number().int(),
    gracePeriod: z.number().int(),
    status: HeartbeatStatusSchema,
    lastPingAt: z.number().int().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    pingUrl: z.string().openapi({ example: "/api/public/ping/my-job-abc123" }),
    recentPings: z.array(RecentPingSchema).default([]),
    incidentCount: z.number().int().default(0),
  })
  .openapi("HeartbeatResponse");

export type HeartbeatStatus = z.infer<typeof HeartbeatStatusSchema>;
export type CreateHeartbeat = z.infer<typeof CreateHeartbeatSchema>;
export type UpdateHeartbeat = z.infer<typeof UpdateHeartbeatSchema>;
export type RecentPing = z.infer<typeof RecentPingSchema>;
export type HeartbeatResponse = z.infer<typeof HeartbeatResponseSchema>;
