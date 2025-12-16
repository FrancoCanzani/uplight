import { z } from "zod";

export const MaintenanceSchema = z.object({
  id: z.number(),
  monitorId: z.number(),
  reason: z.string().nullable(),
  startsAt: z.number(),
  endsAt: z.number(),
  createdAt: z.number(),
});

export const CreateMaintenanceSchema = z.object({
  monitorId: z.number(),
  reason: z.string().max(500).optional(),
  startsAt: z.number(),
  endsAt: z.number(),
});

export const UpdateMaintenanceSchema = z.object({
  reason: z.string().max(500).optional(),
  startsAt: z.number().optional(),
  endsAt: z.number().optional(),
});

export type Maintenance = z.infer<typeof MaintenanceSchema>;
export type CreateMaintenance = z.infer<typeof CreateMaintenanceSchema>;
export type UpdateMaintenance = z.infer<typeof UpdateMaintenanceSchema>;

