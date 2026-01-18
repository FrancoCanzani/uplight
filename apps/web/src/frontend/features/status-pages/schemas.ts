import z from "zod";

export const createStatusPageSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string(),
  isPublic: z.boolean(),
  showHistoricalUptime: z.boolean(),
});

export const updateStatusPageSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(500).nullable().optional(),
  isPublic: z.boolean().optional(),
  showHistoricalUptime: z.boolean().optional(),
});

export const createGroupSchema = z.object({
  label: z.string().min(1).max(30),
  displayOrder: z.int(),
});

export const updateGroupSchema = z.object({
  label: z.string().min(1).max(30).optional(),
  displayOrder: z.int().optional(),
});

export const addMonitorSchema = z.object({
  monitorId: z.int(),
  groupId: z.int().nullable().optional(),
  displayOrder: z.int(),
  displayName: z.string().nullable().optional(),
});

export const updateMonitorSchema = z.object({
  groupId: z.int().nullable().optional(),
  displayOrder: z.int().optional(),
  displayName: z.string().max(50).nullable().optional(),
});

export type CreateStatusPage = z.infer<typeof createStatusPageSchema>;
export type UpdateStatusPage = z.infer<typeof updateStatusPageSchema>;
export type CreateGroup = z.infer<typeof createGroupSchema>;
export type UpdateGroup = z.infer<typeof updateGroupSchema>;
export type AddMonitor = z.infer<typeof addMonitorSchema>;
export type UpdateMonitor = z.infer<typeof updateMonitorSchema>;

export type StatusPageResponse = {
  id: number;
  teamId: number;
  name: string;
  slug: string;
  description: string | null;
  logoKey: string | null;
  isPublic: boolean;
  showHistoricalUptime: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GroupResponse = {
  id: number;
  statusPageId: number;
  label: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type StatusPageMonitorResponse = {
  statusPageId: number;
  monitorId: number;
  groupId: number | null;
  displayOrder: number;
  displayName: string | null;
  createdAt: string;
};
