import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import * as authSchema from "./auth-schema";
import { timestamps } from "./utils";

export const team = sqliteTable("team", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  personal: integer({ mode: "boolean" }).default(false).notNull(),
  ...timestamps,
});

export const teamMember = sqliteTable(
  "team_member",
  {
    teamId: integer()
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => authSchema.user.id, { onDelete: "cascade" }),
    role: text({ enum: ["owner", "admin", "member"] })
      .default("member")
      .notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.teamId, table.userId] }),
    index("team_member_userId_idx").on(table.userId),
    index("team_member_teamId_idx").on(table.teamId),
  ],
);

export const monitor = sqliteTable(
  "monitor",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    teamId: integer()
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    type: text({ enum: ["http", "tcp", "dns"] }).notNull(),
    name: text().notNull(),
    interval: integer().notNull(),
    timeout: integer().notNull().default(30),
    responseTimeThreshold: integer(),
    locations: text().notNull(),
    contentCheck: text(),
    url: text(),
    method: text({
      enum: ["get", "post", "head", "put", "patch", "delete", "options"],
    }),
    headers: text(),
    body: text(),
    username: text(),
    password: text(),
    expectedStatusCodes: text(),
    followRedirects: integer({ mode: "boolean" }).default(true).notNull(),
    checkDomain: integer({ mode: "boolean" }).default(true).notNull(),
    host: text(),
    port: integer(),
    dnsRecordType: text(),
    dnsExpectedValue: text(),
    dnsResolver: text({ enum: ["cloudflare", "google"] })
      .default("cloudflare")
      .notNull(),
    status: text({
      enum: ["up", "down", "degraded", "maintenance", "paused", "initializing"],
    })
      .default("initializing")
      .notNull(),
    ...timestamps,
  },
  (table) => [
    index("monitor_teamId_idx").on(table.teamId),
    index("monitor_type_idx").on(table.type),
    index("monitor_status_idx").on(table.status),
  ],
);

export const heartbeat = sqliteTable(
  "heartbeat",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    teamId: integer()
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    name: text().notNull(),
    slug: text().notNull().unique(),
    period: integer().notNull().default(86400),
    gracePeriod: integer().notNull(),
    status: text({
      enum: ["up", "down", "paused", "initializing"],
    })
      .default("initializing")
      .notNull(),
    lastPingAt: integer({ mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => [
    index("heartbeat_teamId_idx").on(table.teamId),
    index("heartbeat_slug_idx").on(table.slug),
    index("heartbeat_status_idx").on(table.status),
  ],
);

export const heartbeatIncident = sqliteTable(
  "heartbeat_incident",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    heartbeatId: integer()
      .notNull()
      .references(() => heartbeat.id, { onDelete: "cascade" }),
    cause: text().notNull(),
    status: text({ enum: ["ongoing", "resolved"] })
      .default("ongoing")
      .notNull(),
    startedAt: integer({ mode: "timestamp_ms" }).notNull(),
    resolvedAt: integer({ mode: "timestamp_ms" }),
    createdAt: integer({ mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => [
    index("heartbeat_incident_heartbeat_idx").on(table.heartbeatId),
    index("heartbeat_incident_status_idx").on(table.heartbeatId, table.status),
  ],
);

export const heartbeatPing = sqliteTable(
  "heartbeat_ping",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    heartbeatId: integer()
      .notNull()
      .references(() => heartbeat.id, { onDelete: "cascade" }),
    method: text({ enum: ["GET", "POST", "HEAD", "PUT"] })
      .notNull()
      .default("GET"),
    userAgent: text(),
    ip: text(),
    pingedAt: integer({ mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("heartbeat_ping_heartbeat_idx").on(table.heartbeatId),
    index("heartbeat_ping_pinged_at_idx").on(table.pingedAt),
    index("heartbeat_ping_heartbeat_pinged_idx").on(
      table.heartbeatId,
      table.pingedAt,
    ),
  ],
);

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(team, {
    fields: [teamMember.teamId],
    references: [team.id],
  }),
  user: one(authSchema.user, {
    fields: [teamMember.userId],
    references: [authSchema.user.id],
  }),
}));

export const monitorRelations = relations(monitor, ({ one, many }) => ({
  team: one(team, {
    fields: [monitor.teamId],
    references: [team.id],
  }),
  checkResults: many(checkResult),
  incidents: many(incident),
  maintenances: many(maintenance),
  domainCheckResults: many(domainCheckResult),
}));

export const checkResult = sqliteTable(
  "check_result",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    monitorId: integer()
      .notNull()
      .references(() => monitor.id, { onDelete: "cascade" }),
    location: text().notNull(),
    result: text({
      enum: [
        "success",
        "failure",
        "timeout",
        "error",
        "maintenance",
        "degraded",
      ],
    }).notNull(),
    responseTime: integer().notNull(),
    statusCode: integer(),
    errorMessage: text(),
    responseHeaders: text(),
    responseBody: text(),
    retryCount: integer().default(0).notNull(),
    checkedAt: integer({ mode: "timestamp_ms" }).notNull(),
    createdAt: integer({ mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => [
    index("check_result_monitor_idx").on(table.monitorId),
    index("check_result_checked_at_idx").on(table.checkedAt),
    index("check_result_monitor_checked_idx").on(
      table.monitorId,
      table.checkedAt,
    ),
  ],
);

export const checkResultRelations = relations(checkResult, ({ one }) => ({
  monitor: one(monitor, {
    fields: [checkResult.monitorId],
    references: [monitor.id],
  }),
}));

export const incident = sqliteTable(
  "incident",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    monitorId: integer()
      .notNull()
      .references(() => monitor.id, { onDelete: "cascade" }),
    cause: text().notNull(),
    title: text(),
    description: text(),
    hint: text(),
    severity: text({ enum: ["low", "medium", "high", "critical"] }),
    incidentType: text({
      enum: ["availability", "performance", "security", "data", "other"],
    }),
    status: text({
      enum: ["ongoing", "acknowledged", "fixing", "recovered", "resolved"],
    })
      .default("ongoing")
      .notNull(),
    assignees: text(),
    postMortemTitle: text(),
    postMortemContent: text(),
    startedAt: integer({ mode: "timestamp_ms" }).notNull(),
    acknowledgedAt: integer({ mode: "timestamp_ms" }),
    fixingAt: integer({ mode: "timestamp_ms" }),
    recoveredAt: integer({ mode: "timestamp_ms" }),
    resolvedAt: integer({ mode: "timestamp_ms" }),
  },
  (table) => [
    index("incident_monitor_idx").on(table.monitorId),
    index("incident_monitor_status_idx").on(table.monitorId, table.status),
  ],
);

export const incidentActivity = sqliteTable(
  "incident_activity",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    incidentId: integer()
      .notNull()
      .references(() => incident.id, { onDelete: "cascade" }),
    userId: text().references(() => authSchema.user.id, {
      onDelete: "set null",
    }),
    type: text({
      enum: [
        "status_change",
        "assignee_added",
        "assignee_removed",
        "comment",
        "type_changed",
        "severity_changed",
      ],
    }).notNull(),
    content: text(),
    metadata: text(),
    createdAt: integer({ mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => [
    index("incident_activity_incident_idx").on(table.incidentId),
    index("incident_activity_created_idx").on(table.createdAt),
  ],
);

export const incidentRelations = relations(incident, ({ one, many }) => ({
  monitor: one(monitor, {
    fields: [incident.monitorId],
    references: [monitor.id],
  }),
  activities: many(incidentActivity),
}));

export const incidentActivityRelations = relations(
  incidentActivity,
  ({ one }) => ({
    incident: one(incident, {
      fields: [incidentActivity.incidentId],
      references: [incident.id],
    }),
    user: one(authSchema.user, {
      fields: [incidentActivity.userId],
      references: [authSchema.user.id],
    }),
  }),
);

export const maintenance = sqliteTable(
  "maintenance",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    monitorId: integer()
      .notNull()
      .references(() => monitor.id, { onDelete: "cascade" }),
    reason: text(),
    startsAt: integer({ mode: "timestamp_ms" }).notNull(),
    endsAt: integer({ mode: "timestamp_ms" }).notNull(),
    createdAt: integer({ mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => [
    index("maintenance_monitor_idx").on(table.monitorId),
    index("maintenance_active_idx").on(table.startsAt, table.endsAt),
  ],
);

export const maintenanceRelations = relations(maintenance, ({ one }) => ({
  monitor: one(monitor, {
    fields: [maintenance.monitorId],
    references: [monitor.id],
  }),
}));

export const domainCheckResult = sqliteTable(
  "domain_check_result",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    monitorId: integer()
      .notNull()
      .references(() => monitor.id, { onDelete: "cascade" }),
    domain: text().notNull(),
    whoisCreatedDate: text(),
    whoisUpdatedDate: text(),
    whoisExpirationDate: text(),
    whoisRegistrar: text(),
    whoisError: text(),
    sslIssuer: text(),
    sslExpiry: integer({ mode: "timestamp_ms" }),
    sslIsSelfSigned: integer({ mode: "boolean" }),
    sslError: text(),
    checkedAt: integer({ mode: "timestamp_ms" }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("domain_check_monitor_idx").on(table.monitorId),
    index("domain_check_checked_at_idx").on(table.checkedAt),
  ],
);

export const domainCheckResultRelations = relations(
  domainCheckResult,
  ({ one }) => ({
    monitor: one(monitor, {
      fields: [domainCheckResult.monitorId],
      references: [monitor.id],
    }),
  }),
);

export const heartbeatRelations = relations(heartbeat, ({ one, many }) => ({
  team: one(team, {
    fields: [heartbeat.teamId],
    references: [team.id],
  }),
  incidents: many(heartbeatIncident),
  pings: many(heartbeatPing),
}));

export const heartbeatIncidentRelations = relations(
  heartbeatIncident,
  ({ one }) => ({
    heartbeat: one(heartbeat, {
      fields: [heartbeatIncident.heartbeatId],
      references: [heartbeat.id],
    }),
  }),
);

export const heartbeatPingRelations = relations(heartbeatPing, ({ one }) => ({
  heartbeat: one(heartbeat, {
    fields: [heartbeatPing.heartbeatId],
    references: [heartbeat.id],
  }),
}));

export const integration = sqliteTable(
  "integration",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    teamId: integer()
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    type: text({
      enum: [
        "email",
        "slack",
        "discord",
        "webhook",
        "github",
        "pagerduty",
        "teams",
        "opsgenie",
        "linear",
        "jira",
        "sms",
      ],
    }).notNull(),
    enabled: integer({ mode: "boolean" }).default(false).notNull(),
    config: text().notNull(),
    ...timestamps,
  },
  (table) => [
    index("integration_teamId_idx").on(table.teamId),
    index("integration_type_idx").on(table.type),
    index("integration_enabled_idx").on(table.enabled),
  ],
);

export const integrationRelations = relations(integration, ({ one }) => ({
  team: one(team, {
    fields: [integration.teamId],
    references: [team.id],
  }),
}));

export const statusPage = sqliteTable(
  "status_page",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    teamId: integer()
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text(),
    logoKey: text(),
    isPublic: integer({ mode: "boolean" }).default(true).notNull(),
    showHistoricalUptime: integer({ mode: "boolean" }).default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index("status_page_teamId_idx").on(table.teamId),
    index("status_page_slug_idx").on(table.slug),
  ],
);

export const statusPageGroup = sqliteTable(
  "status_page_group",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    statusPageId: integer()
      .notNull()
      .references(() => statusPage.id, { onDelete: "cascade" }),
    label: text().notNull(),
    displayOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("status_page_group_page_idx").on(table.statusPageId),
    index("status_page_group_order_idx").on(
      table.statusPageId,
      table.displayOrder,
    ),
  ],
);

export const statusPageMonitor = sqliteTable(
  "status_page_monitor",
  {
    statusPageId: integer()
      .notNull()
      .references(() => statusPage.id, { onDelete: "cascade" }),
    monitorId: integer()
      .notNull()
      .references(() => monitor.id, { onDelete: "cascade" }),
    groupId: integer().references(() => statusPageGroup.id, {
      onDelete: "cascade",
    }),
    displayOrder: integer().notNull().default(0),
    displayName: text(),
    createdAt: integer({ mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.statusPageId, table.monitorId] }),
    index("status_page_monitor_page_idx").on(table.statusPageId),
    index("status_page_monitor_monitor_idx").on(table.monitorId),
    index("status_page_monitor_group_idx").on(table.groupId),
  ],
);

export const statusPageSubscriber = sqliteTable(
  "status_page_subscriber",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    statusPageId: integer()
      .notNull()
      .references(() => statusPage.id, { onDelete: "cascade" }),
    email: text().notNull(),
    isVerified: integer({ mode: "boolean" }).default(false).notNull(),
    verificationToken: text(),
    subscribedAt: integer({ mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => [
    index("status_page_subscriber_page_idx").on(table.statusPageId),
    uniqueIndex("status_page_subscriber_unique_email_idx").on(
      table.statusPageId,
      table.email,
    ),
  ],
);

export const statusPageRelations = relations(statusPage, ({ one, many }) => ({
  team: one(team, {
    fields: [statusPage.teamId],
    references: [team.id],
  }),
  groups: many(statusPageGroup),
  monitors: many(statusPageMonitor),
  subscribers: many(statusPageSubscriber),
}));

export const statusPageGroupRelations = relations(
  statusPageGroup,
  ({ one, many }) => ({
    statusPage: one(statusPage, {
      fields: [statusPageGroup.statusPageId],
      references: [statusPage.id],
    }),
    monitors: many(statusPageMonitor),
  }),
);

export const statusPageMonitorRelations = relations(
  statusPageMonitor,
  ({ one }) => ({
    statusPage: one(statusPage, {
      fields: [statusPageMonitor.statusPageId],
      references: [statusPage.id],
    }),
    monitor: one(monitor, {
      fields: [statusPageMonitor.monitorId],
      references: [monitor.id],
    }),
    group: one(statusPageGroup, {
      fields: [statusPageMonitor.groupId],
      references: [statusPageGroup.id],
    }),
  }),
);

export const statusPageSubscriberRelations = relations(
  statusPageSubscriber,
  ({ one }) => ({
    statusPage: one(statusPage, {
      fields: [statusPageSubscriber.statusPageId],
      references: [statusPage.id],
    }),
  }),
);

export const teamRelations = relations(team, ({ many }) => ({
  members: many(teamMember),
  monitors: many(monitor),
  heartbeats: many(heartbeat),
  integrations: many(integration),
  statusPages: many(statusPage),
}));

export const schema = {
  ...authSchema,
  team,
  teamMember,
  monitor,
  checkResult,
  incident,
  incidentActivity,
  maintenance,
  domainCheckResult,
  heartbeat,
  heartbeatIncident,
  heartbeatPing,
  integration,
  statusPage,
  statusPageGroup,
  statusPageMonitor,
  statusPageSubscriber,
} as const;
