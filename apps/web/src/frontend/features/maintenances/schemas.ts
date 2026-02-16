import { z } from "zod";

export const MaintenanceMonitorSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.enum([
    "up",
    "down",
    "degraded",
    "maintenance",
    "paused",
    "initializing",
  ]),
});

export const MaintenanceSchema = z.object({
  id: z.number(),
  teamId: z.number(),
  reason: z.string().nullable(),
  startsAt: z.number(),
  endsAt: z.number(),
  createdAt: z.number(),
  monitorIds: z.array(z.number()),
  monitors: z.array(MaintenanceMonitorSchema),
});

export const CreateMaintenanceSchema = z.object({
  monitorIds: z.array(z.number()).min(1, "Select at least one monitor"),
  reason: z.string().max(500).optional(),
  startsAt: z.number(),
  endsAt: z.number(),
});

export const UpdateMaintenanceSchema = z.object({
  monitorIds: z
    .array(z.number())
    .min(1, "Select at least one monitor")
    .optional(),
  reason: z.string().max(500).optional(),
  startsAt: z.number().optional(),
  endsAt: z.number().optional(),
});

export const MaintenanceFormSchema = z
  .object({
    monitorIds: z.array(z.number()).min(1, "Select at least one monitor"),
    reason: z.string().max(500).optional(),
    startsAt: z.string().min(1, "Start time is required"),
    endsAt: z.string().min(1, "End time is required"),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: "End time must be after start time",
    path: ["endsAt"],
  });

export type Maintenance = z.infer<typeof MaintenanceSchema>;
export type MaintenanceMonitor = z.infer<typeof MaintenanceMonitorSchema>;
export type CreateMaintenance = z.infer<typeof CreateMaintenanceSchema>;
export type UpdateMaintenance = z.infer<typeof UpdateMaintenanceSchema>;
export type MaintenanceFormInput = z.infer<typeof MaintenanceFormSchema>;
