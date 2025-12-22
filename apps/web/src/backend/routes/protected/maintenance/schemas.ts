import { z } from "@hono/zod-openapi";

export const CreateMaintenanceSchema = z
  .object({
    monitorId: z.number().int(),
    reason: z.string().max(500).optional(),
    startsAt: z.number().int(),
    endsAt: z.number().int(),
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "End time must be after start time",
  })
  .openapi("CreateMaintenance");

export const UpdateMaintenanceSchema = z
  .object({
    reason: z.string().max(500).optional(),
    startsAt: z.number().int().optional(),
    endsAt: z.number().int().optional(),
  })
  .openapi("UpdateMaintenance");

export const MaintenanceResponseSchema = z
  .object({
    id: z.number().int(),
    monitorId: z.number().int(),
    reason: z.string().nullable(),
    startsAt: z.number().int(),
    endsAt: z.number().int(),
    createdAt: z.number().int(),
  })
  .openapi("MaintenanceResponse");

export type CreateMaintenance = z.infer<typeof CreateMaintenanceSchema>;
export type UpdateMaintenance = z.infer<typeof UpdateMaintenanceSchema>;
export type MaintenanceResponse = z.infer<typeof MaintenanceResponseSchema>;

