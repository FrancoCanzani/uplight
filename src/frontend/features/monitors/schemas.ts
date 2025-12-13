import z from "zod";

export const LocationSchema = z.enum([
  "wnam",
  "enam",
  "sam",
  "weur",
  "eeur",
  "apac",
  "oc",
  "afr",
  "me",
]);

export const ContentCheckSchema = z.object({
  enabled: z.boolean().default(false),
  mode: z.enum(["contains", "not_contains"]),
  content: z.string().max(1000),
});

export const HttpMonitorSchema = z.object({
  type: z.literal("http"),
  name: z.string().min(1).max(50),
  url: z.url({
    protocol: /^https?$/,
    hostname: z.regexes.domain,
  }),
  method: z.enum(["get", "post", "head", "put", "patch", "delete", "options"]),
  interval: z.int().min(30000).max(1800000),
  timeout: z.int().min(1).max(60).default(30),
  locations: z
    .array(LocationSchema)
    .min(1, "Please select at least one monitoring location"),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().max(10000).optional(),
  username: z.string().max(50).optional(),
  password: z.string().max(50).optional(),
  expectedStatusCodes: z.array(z.int().min(100).max(599)).default([200]),
  followRedirects: z.boolean().default(true),
  verifySSL: z.boolean().default(true),
  checkDNS: z.boolean().default(true),
  contentCheck: ContentCheckSchema.optional(),
});

export const TcpMonitorSchema = z.object({
  type: z.literal("tcp"),
  name: z.string().min(1).max(50),
  host: z.string().min(1).max(255),
  port: z.int().min(1).max(65535),
  interval: z.int().min(30000).max(1800000),
  timeout: z.int().min(1).max(60).default(30),
  locations: z
    .array(LocationSchema)
    .min(1, "Please select at least one monitoring location"),
  contentCheck: ContentCheckSchema.optional(),
});

export const MonitorSchema = z.discriminatedUnion("type", [
  HttpMonitorSchema,
  TcpMonitorSchema,
]);

export const CreateMonitorSchema = MonitorSchema;

export const UpdateMonitorSchema = z.discriminatedUnion("type", [
  HttpMonitorSchema.partial().extend({ type: z.literal("http") }),
  TcpMonitorSchema.partial().extend({ type: z.literal("tcp") }),
]);

export const MonitorStatusSchema = z.enum([
  "up",
  "down",
  "downgraded",
  "maintenance",
  "paused",
  "initializing",
]);

export const MonitorResponseSchema = z.object({
  id: z.number(),
  teamId: z.number(),
  type: z.enum(["http", "tcp"]),
  name: z.string(),
  interval: z.number(),
  timeout: z.number(),
  locations: z.string(),
  contentCheck: z.string().nullable(),
  url: z.string().nullable(),
  method: z
    .enum(["get", "post", "head", "put", "patch", "delete", "options"])
    .nullable(),
  headers: z.string().nullable(),
  body: z.string().nullable(),
  username: z.string().nullable(),
  password: z.string().nullable(),
  expectedStatusCodes: z.string().nullable(),
  followRedirects: z.boolean(),
  verifySSL: z.boolean(),
  checkDNS: z.boolean(),
  host: z.string().nullable(),
  port: z.number().nullable(),
  status: MonitorStatusSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Location = z.infer<typeof LocationSchema>;
export type ContentCheck = z.infer<typeof ContentCheckSchema>;

export type HttpMonitor = z.infer<typeof HttpMonitorSchema>;
export type HttpMonitorInput = z.input<typeof HttpMonitorSchema>;

export type TcpMonitor = z.infer<typeof TcpMonitorSchema>;
export type TcpMonitorInput = z.input<typeof TcpMonitorSchema>;

export type Monitor = z.infer<typeof MonitorSchema>;
export type CreateMonitor = z.infer<typeof CreateMonitorSchema>;
export type UpdateMonitor = z.infer<typeof UpdateMonitorSchema>;
export type MonitorStatus = z.infer<typeof MonitorStatusSchema>;
export type MonitorResponse = z.infer<typeof MonitorResponseSchema>;
