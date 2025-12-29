import z from "zod";

export const HeartbeatStatusSchema = z.enum([
  "up",
  "down",
  "paused",
  "initializing",
]);

export const CreateHeartbeatSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  gracePeriod: z.int().min(60).max(86400),
});

export const UpdateHeartbeatSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  gracePeriod: z.int().min(60).max(86400).optional(),
});

export const HeartbeatResponseSchema = z.object({
  id: z.number(),
  teamId: z.number(),
  type: z.literal("heartbeat"),
  name: z.string(),
  slug: z.string(),
  gracePeriod: z.number(),
  status: HeartbeatStatusSchema,
  lastPingAt: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  pingUrl: z.string(),
});

export type HeartbeatStatus = z.infer<typeof HeartbeatStatusSchema>;
export type CreateHeartbeat = z.infer<typeof CreateHeartbeatSchema>;
export type CreateHeartbeatInput = z.input<typeof CreateHeartbeatSchema>;
export type UpdateHeartbeat = z.infer<typeof UpdateHeartbeatSchema>;
export type HeartbeatResponse = z.infer<typeof HeartbeatResponseSchema>;
