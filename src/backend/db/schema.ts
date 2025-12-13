import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import * as authSchema from "./auth-schema";
import { timestamps } from "./utils";

export const monitor = sqliteTable(
  "monitor",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => authSchema.user.id, { onDelete: "cascade" }),
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
    index("monitor_userId_idx").on(table.userId),
    index("monitor_type_idx").on(table.type),
    index("monitor_status_idx").on(table.status),
  ]
);

export const monitorRelations = relations(monitor, ({ one }) => ({
  user: one(authSchema.user, {
    fields: [monitor.userId],
    references: [authSchema.user.id],
  }),
}));

export const schema = {
  ...authSchema,
  monitor,
} as const;
