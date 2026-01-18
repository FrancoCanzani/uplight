import { OpenAPIHono } from "@hono/zod-openapi";
import { and, desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import {
    checkResult,
    monitor,
    statusPage,
    statusPageGroup,
    statusPageMonitor,
} from "../../../db/schema";
import type { AppEnv } from "../../../types";

export function registerGetPublicStatusPage(api: OpenAPIHono<AppEnv>) {
  return api.get("/status/:slug", async (c) => {
    const slug = c.req.param("slug");

    if (!slug) {
      throw new HTTPException(400, { message: "Invalid slug" });
    }

    const db = createDb(c.env.DB);

    const [page] = await db
      .select()
      .from(statusPage)
      .where(and(eq(statusPage.slug, slug), eq(statusPage.isPublic, true)))
      .limit(1);

    if (!page) {
      throw new HTTPException(404, { message: "Status page not found" });
    }

    const groups = await db
      .select()
      .from(statusPageGroup)
      .where(eq(statusPageGroup.statusPageId, page.id))
      .orderBy(statusPageGroup.displayOrder);

    const monitors = await db
      .select({
        statusPageMonitor,
        monitor,
      })
      .from(statusPageMonitor)
      .innerJoin(monitor, eq(statusPageMonitor.monitorId, monitor.id))
      .where(eq(statusPageMonitor.statusPageId, page.id))
      .orderBy(statusPageMonitor.displayOrder);

    const monitorsWithUptime = await Promise.all(
      monitors.map(async ({ statusPageMonitor: spm, monitor: mon }) => {
        const checks = await db
          .select()
          .from(checkResult)
          .where(eq(checkResult.monitorId, mon.id))
          .orderBy(desc(checkResult.checkedAt))
          .limit(100);

        const successCount = checks.filter((c) => c.result === "success").length;
        const uptime = checks.length > 0 ? (successCount / checks.length) * 100 : 100;

        return {
          monitorId: mon.id,
          name: spm.displayName || mon.name,
          status: mon.status,
          groupId: spm.groupId,
          displayOrder: spm.displayOrder,
          uptime: Number(uptime.toFixed(2)),
          lastCheck: checks[0]
            ? {
                checkedAt: checks[0].checkedAt.toISOString(),
                result: checks[0].result,
                responseTime: checks[0].responseTime,
              }
            : null,
        };
      }),
    );

    const groupsWithMonitors = groups.map((group) => ({
      id: group.id,
      label: group.label,
      displayOrder: group.displayOrder,
      monitors: monitorsWithUptime
        .filter((m) => m.groupId === group.id)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    }));

    const ungroupedMonitors = monitorsWithUptime
      .filter((m) => m.groupId === null)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const allMonitors = monitorsWithUptime;
    const operationalCount = allMonitors.filter((m) => m.status === "up").length;
    const totalCount = allMonitors.length;

    let overallStatus: "operational" | "degraded" | "outage";
    if (operationalCount === totalCount) {
      overallStatus = "operational";
    } else if (operationalCount > 0) {
      overallStatus = "degraded";
    } else {
      overallStatus = "outage";
    }

    return c.json({
      page: {
        name: page.name,
        slug: page.slug,
        description: page.description,
        logoKey: page.logoKey,
        showHistoricalUptime: page.showHistoricalUptime,
      },
      overallStatus,
      stats: {
        total: totalCount,
        operational: operationalCount,
        degraded: allMonitors.filter((m) => m.status === "degraded").length,
        down: allMonitors.filter((m) => m.status === "down").length,
      },
      groups: groupsWithMonitors,
      ungroupedMonitors,
    });
  });
}
