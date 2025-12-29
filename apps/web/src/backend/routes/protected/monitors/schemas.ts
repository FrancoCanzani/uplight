import { z } from "@hono/zod-openapi";

export const LocationSchema = z
  .enum(["wnam", "enam", "sam", "weur", "eeur", "apac", "oc", "afr", "me"])
  .openapi({ example: "wnam" });

export const ContentCheckSchema = z
  .object({
    enabled: z.boolean().default(false),
    mode: z.enum(["contains", "not_contains"]),
    content: z.string().max(1000),
  })
  .openapi("ContentCheck");

export const HttpMonitorSchema = z
  .object({
    type: z.literal("http"),
    name: z.string().min(1).max(50).openapi({ example: "My Website" }),
    url: z.url().openapi({ example: "https://example.com" }),
    method: z.enum([
      "get",
      "post",
      "head",
      "put",
      "patch",
      "delete",
      "options",
    ]),
    interval: z
      .number()
      .int()
      .min(60000)
      .max(1800000)
      .openapi({ example: 60000 }),
    timeout: z.number().int().min(1).max(60).default(30),
    responseTimeThreshold: z.number().int().min(1).optional(),
    locations: z
      .array(LocationSchema)
      .min(1, "Please select at least one monitoring location"),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.string().max(10000).optional(),
    username: z.string().max(50).optional(),
    password: z.string().max(50).optional(),
    expectedStatusCodes: z
      .array(z.number().int().min(100).max(599))
      .default([200]),
    followRedirects: z.boolean().default(true),
    verifySSL: z.boolean().default(true),
    checkDNS: z.boolean().default(true),
    checkDomain: z.boolean().default(true),
    contentCheck: ContentCheckSchema.optional(),
  })
  .openapi("HttpMonitor");

export const TcpMonitorSchema = z
  .object({
    type: z.literal("tcp"),
    name: z.string().min(1).max(50).openapi({ example: "Database Server" }),
    host: z.string().min(1).max(255).openapi({ example: "db.example.com" }),
    port: z.number().int().min(1).max(65535).openapi({ example: 5432 }),
    interval: z
      .number()
      .int()
      .min(60000)
      .max(1800000)
      .openapi({ example: 60000 }),
    timeout: z.number().int().min(1).max(60).default(30),
    responseTimeThreshold: z.number().int().min(1).optional(),
    locations: z
      .array(LocationSchema)
      .min(1, "Please select at least one monitoring location"),
  })
  .openapi("TcpMonitor");

export const CreateMonitorSchema = z
  .discriminatedUnion("type", [HttpMonitorSchema, TcpMonitorSchema])
  .openapi("CreateMonitor");

export const MonitorStatusSchema = z.enum([
  "up",
  "down",
  "degraded",
  "maintenance",
  "paused",
  "initializing",
]);

export const DomainCheckSchema = z
  .object({
    id: z.number().int(),
    domain: z.string(),
    whoisCreatedDate: z.string().nullable(),
    whoisUpdatedDate: z.string().nullable(),
    whoisExpirationDate: z.string().nullable(),
    whoisRegistrar: z.string().nullable(),
    whoisError: z.string().nullable(),
    sslIssuer: z.string().nullable(),
    sslExpiry: z.number().int().nullable(),
    sslIsSelfSigned: z.boolean().nullable(),
    sslError: z.string().nullable(),
    checkedAt: z.number().int(),
  })
  .nullable()
  .openapi("DomainCheck");

export const MonitorResponseSchema = z
  .object({
    id: z.number().int().openapi({ example: 1 }),
    teamId: z.number().int(),
    type: z.enum(["http", "tcp"]),
    name: z.string(),
    interval: z.number().int(),
    timeout: z.number().int(),
    responseTimeThreshold: z.number().int().nullable(),
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
    checkDomain: z.boolean(),
    host: z.string().nullable(),
    port: z.number().int().nullable(),
    status: MonitorStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    domainCheck: DomainCheckSchema,
    lastCheckAt: z.number().int().nullable(),
    lastResponseTime: z.number().int().nullable(),
  })
  .openapi("MonitorResponse");

export type Location = z.infer<typeof LocationSchema>;
export type ContentCheck = z.infer<typeof ContentCheckSchema>;
export type HttpMonitor = z.infer<typeof HttpMonitorSchema>;
export type TcpMonitor = z.infer<typeof TcpMonitorSchema>;
export type CreateMonitor = z.infer<typeof CreateMonitorSchema>;
export type MonitorResponse = z.infer<typeof MonitorResponseSchema>;
