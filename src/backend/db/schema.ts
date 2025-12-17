import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
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
    type: text({ enum: ["http", "tcp"] }).notNull(),
    name: text().notNull(),
    interval: integer().notNull(),
    timeout: integer().notNull().default(30),
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
    verifySSL: integer({ mode: "boolean" }).default(true).notNull(),
    checkDNS: integer({ mode: "boolean" }).default(true).notNull(),
    host: text(),
    port: integer(),
    status: text({
      enum: [
        "up",
        "down",
        "downgraded",
        "maintenance",
        "paused",
        "initializing",
      ],
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

export const teamRelations = relations(team, ({ many }) => ({
  members: many(teamMember),
  monitors: many(monitor),
}));

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
      enum: ["success", "failure", "timeout", "error", "maintenance"],
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
    index("incident_monitor_idx").on(table.monitorId),
    index("incident_monitor_status_idx").on(table.monitorId, table.status),
  ],
);

export const incidentRelations = relations(incident, ({ one }) => ({
  monitor: one(monitor, {
    fields: [incident.monitorId],
    references: [monitor.id],
  }),
}));

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

export const schema = {
  ...authSchema,
  team,
  teamMember,
  monitor,
  checkResult,
  incident,
  maintenance,
} as const;
