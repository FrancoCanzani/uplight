import z from "zod";

export const HeartbeatStatusSchema = z.enum([
  "up",
  "down",
  "paused",
  "initializing",
]);

export const CreateHeartbeatSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  period: z.int().min(60).max(2592000),
  gracePeriod: z.int().min(60).max(86400),
});

export const UpdateHeartbeatSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  period: z.int().min(60).max(2592000).optional(),
  gracePeriod: z.int().min(60).max(86400).optional(),
});

export const RecentPingSchema = z.object({
  id: z.number(),
  method: z.enum(["GET", "POST", "HEAD", "PUT"]),
  userAgent: z.string().nullable(),
  ip: z.string().nullable(),
  pingedAt: z.number(),
});

export const HeartbeatResponseSchema = z.object({
  id: z.number(),
  teamId: z.number(),
  type: z.literal("heartbeat"),
  name: z.string(),
  slug: z.string(),
  period: z.number(),
  gracePeriod: z.number(),
  status: HeartbeatStatusSchema,
  lastPingAt: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  pingUrl: z.string(),
  recentPings: z.array(RecentPingSchema).default([]),
  incidentCount: z.number().default(0),
});

export type HeartbeatStatus = z.infer<typeof HeartbeatStatusSchema>;
export type CreateHeartbeat = z.infer<typeof CreateHeartbeatSchema>;
export type CreateHeartbeatInput = z.input<typeof CreateHeartbeatSchema>;
export type UpdateHeartbeat = z.infer<typeof UpdateHeartbeatSchema>;
export type RecentPing = z.infer<typeof RecentPingSchema>;
export type HeartbeatResponse = z.infer<typeof HeartbeatResponseSchema>;
