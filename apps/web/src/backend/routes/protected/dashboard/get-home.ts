import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import {
  checkResult,
  domainCheckResult,
  heartbeat,
  heartbeatIncident,
  incident,
  monitor,
} from "../../../db/schema";
import type { AppEnv } from "../../../types";

const AssignedIncidentSchema = z.object({
  id: z.number(),
  monitorId: z.number(),
  monitorName: z.string(),
  cause: z.string(),
  title: z.string().nullable(),
  severity: z.enum(["low", "medium", "high", "critical"]).nullable(),
  status: z.enum(["ongoing", "acknowledged", "fixing", "recovered", "resolved"]),
  startedAt: z.number(),
  type: z.enum(["monitor", "heartbeat"]),
});

const MonitorSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  url: z.string().nullable(),
  host: z.string().nullable(),
  lastResponseTime: z.number().nullable(),
});

const ExpiringCertSchema = z.object({
  monitorId: z.number(),
  monitorName: z.string(),
  domain: z.string(),
  daysUntilExpiry: z.number(),
});

const ResponseSchema = z.object({
  assignedIncidents: z.array(AssignedIncidentSchema),
  needsAttention: z.object({
    downMonitors: z.array(MonitorSummarySchema),
    degradedMonitors: z.array(MonitorSummarySchema),
    expiringCerts: z.array(ExpiringCertSchema),
  }),
  stats: z.object({
    monitors: z.object({
      total: z.number(),
      up: z.number(),
      down: z.number(),
      degraded: z.number(),
      paused: z.number(),
    }),
    heartbeats: z.object({
      total: z.number(),
      up: z.number(),
      down: z.number(),
    }),
    incidents: z.object({
      total: z.number(),
      ongoing: z.number(),
      acknowledged: z.number(),
      resolved: z.number(),
    }),
    avgUptime: z.number(),
    avgResolveTime: z.number().nullable(),
  }),
});

const route = createRoute({
  method: "get",
  path: "/:teamId/home",
  tags: ["dashboard"],
  summary: "Get dashboard home data",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "Dashboard home data",
    },
  },
});

export function registerGetDashboardHome(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const user = c.get("user");

    if (!teamContext || !user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all monitors
    const monitors = await db
      .select()
      .from(monitor)
      .where(eq(monitor.teamId, teamContext.teamId));

    // Fetch all heartbeats
    const heartbeats = await db
      .select()
      .from(heartbeat)
      .where(eq(heartbeat.teamId, teamContext.teamId));

    const monitorIds = monitors.map((m) => m.id);
    const heartbeatIds = heartbeats.map((h) => h.id);

    // Fetch incidents for the last 7 days
    let monitorIncidents: (typeof incident.$inferSelect)[] = [];
    if (monitorIds.length > 0) {
      monitorIncidents = await db
        .select()
        .from(incident)
        .where(
          and(
            inArray(incident.monitorId, monitorIds),
            gte(incident.startedAt, sevenDaysAgo)
          )
        )
        .orderBy(desc(incident.startedAt));
    }

    let hbIncidents: (typeof heartbeatIncident.$inferSelect)[] = [];
    if (heartbeatIds.length > 0) {
      hbIncidents = await db
        .select()
        .from(heartbeatIncident)
        .where(
          and(
            inArray(heartbeatIncident.heartbeatId, heartbeatIds),
            gte(heartbeatIncident.startedAt, sevenDaysAgo)
          )
        );
    }

    // Build monitor name map
    const monitorMap = new Map(monitors.map((m) => [m.id, m]));
    const heartbeatMap = new Map(heartbeats.map((h) => [h.id, h]));

    // Find incidents assigned to current user
    const assignedIncidents: z.infer<typeof AssignedIncidentSchema>[] = [];
    for (const inc of monitorIncidents) {
      if (inc.status === "resolved") continue;

      let assignees: string[] = [];
      if (inc.assignees) {
        try {
          assignees = JSON.parse(inc.assignees);
        } catch {
          assignees = [];
        }
      }

      if (assignees.includes(user.id)) {
        const mon = monitorMap.get(inc.monitorId);
        assignedIncidents.push({
          id: inc.id,
          monitorId: inc.monitorId,
          monitorName: mon?.name ?? "Unknown",
          cause: inc.cause,
          title: inc.title,
          severity: inc.severity,
          status: inc.status,
          startedAt: inc.startedAt.getTime(),
          type: "monitor",
        });
      }
    }

    // Sort assigned incidents by severity (critical first)
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    assignedIncidents.sort((a, b) => {
      const aSev = a.severity ? severityOrder[a.severity] : 4;
      const bSev = b.severity ? severityOrder[b.severity] : 4;
      return aSev - bSev;
    });

    // Needs attention: down and degraded monitors
    const downMonitors = monitors
      .filter((m) => m.status === "down")
      .map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        url: m.url,
        host: m.host,
        lastResponseTime: null,
      }));

    const degradedMonitors = monitors
      .filter((m) => m.status === "degraded")
      .map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        url: m.url,
        host: m.host,
        lastResponseTime: null,
      }));

    // Fetch domain check results for SSL expiry
    const expiringCerts: z.infer<typeof ExpiringCertSchema>[] = [];
    if (monitorIds.length > 0) {
      const domainChecks = await db
        .select()
        .from(domainCheckResult)
        .where(inArray(domainCheckResult.monitorId, monitorIds))
        .orderBy(desc(domainCheckResult.checkedAt));

      const seenMonitors = new Set<number>();
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      for (const check of domainChecks) {
        if (seenMonitors.has(check.monitorId)) continue;
        seenMonitors.add(check.monitorId);

        if (check.sslExpiry) {
          const expiryTime = check.sslExpiry.getTime();
          const daysUntil = Math.floor((expiryTime - now) / (24 * 60 * 60 * 1000));

          if (daysUntil <= 30 && daysUntil > 0) {
            const mon = monitorMap.get(check.monitorId);
            expiringCerts.push({
              monitorId: check.monitorId,
              monitorName: mon?.name ?? "Unknown",
              domain: check.domain,
              daysUntilExpiry: daysUntil,
            });
          }
        }
      }

      expiringCerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    }

    // Calculate stats
    const monitorStats = {
      total: monitors.length,
      up: monitors.filter((m) => m.status === "up").length,
      down: monitors.filter((m) => m.status === "down").length,
      degraded: monitors.filter((m) => m.status === "degraded").length,
      paused: monitors.filter((m) => m.status === "paused").length,
    };

    const heartbeatStats = {
      total: heartbeats.length,
      up: heartbeats.filter((h) => h.status === "up").length,
      down: heartbeats.filter((h) => h.status === "down").length,
    };

    const allIncidents = [
      ...monitorIncidents.map((i) => ({ ...i, type: "monitor" as const })),
      ...hbIncidents.map((i) => ({ ...i, type: "heartbeat" as const })),
    ];

    const incidentStats = {
      total: allIncidents.length,
      ongoing: allIncidents.filter((i) => i.status === "ongoing").length,
      acknowledged: allIncidents.filter((i) => i.status === "acknowledged").length,
      resolved: allIncidents.filter((i) => i.status === "resolved").length,
    };

    // Calculate average uptime from recent checks
    let avgUptime = 100;
    if (monitorIds.length > 0) {
      const recentChecks = await db
        .select({
          result: checkResult.result,
        })
        .from(checkResult)
        .where(
          and(
            inArray(checkResult.monitorId, monitorIds),
            gte(checkResult.checkedAt, sevenDaysAgo)
          )
        );

      if (recentChecks.length > 0) {
        const successCount = recentChecks.filter(
          (c) => c.result === "success" || c.result === "degraded"
        ).length;
        avgUptime = Number(((successCount / recentChecks.length) * 100).toFixed(2));
      }
    }

    // Calculate average resolve time
    let avgResolveTime: number | null = null;
    const resolvedIncidents = monitorIncidents.filter(
      (i) => i.status === "resolved" && i.resolvedAt
    );
    if (resolvedIncidents.length > 0) {
      const totalResolveTime = resolvedIncidents.reduce((sum, i) => {
        const resolveMs = i.resolvedAt!.getTime() - i.startedAt.getTime();
        return sum + resolveMs;
      }, 0);
      avgResolveTime = Math.round(totalResolveTime / resolvedIncidents.length);
    }

    return c.json(
      {
        assignedIncidents,
        needsAttention: {
          downMonitors,
          degradedMonitors,
          expiringCerts,
        },
        stats: {
          monitors: monitorStats,
          heartbeats: heartbeatStats,
          incidents: incidentStats,
          avgUptime,
          avgResolveTime,
        },
      },
      200
    );
  });
}
