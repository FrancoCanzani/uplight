import { relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
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
  ]
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
  ]
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

export const monitorRelations = relations(monitor, ({ one }) => ({
  team: one(team, {
    fields: [monitor.teamId],
    references: [team.id],
  }),
}));

export const schema = {
  ...authSchema,
  team,
  teamMember,
  monitor,
} as const;
