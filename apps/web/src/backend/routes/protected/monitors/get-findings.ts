import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { analystFinding, monitor } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const FindingSeveritySchema = z.enum([
  "healthy",
  "watch",
  "warning",
  "critical",
  "predicted",
]);

const FindingSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  severity: FindingSeveritySchema,
  anomalies: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
      }),
    )
    .default([]),
  prediction: z.record(z.string(), z.unknown()).nullable(),
  summary: z.string().nullable(),
  notified: z.boolean(),
});

const route = createRoute({
  method: "get",
  path: "/:teamId/:monitorId/findings",
  tags: ["monitors"],
  summary: "Get monitor analyst findings",
  request: {
    query: z.object({
      limit: z.coerce.number().int().min(1).max(200).optional().default(30),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(FindingSchema),
        },
      },
      description: "Most recent analyst findings for this monitor",
    },
  },
});

function parseJsonArray(
  raw: string | null,
): Array<{ type: string; description: string }> {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is { type: string; description: string } =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { type?: unknown }).type === "string" &&
        typeof (item as { description?: unknown }).description === "string",
    );
  } catch {
    return [];
  }
}

function parseJsonRecord(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export function registerGetFindings(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    const { monitorId } = c.req.param();
    const { limit } = c.req.valid("query");

    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);
    const monitorIdNum = Number(monitorId);

    const [mon] = await db
      .select({ id: monitor.id })
      .from(monitor)
      .where(
        and(eq(monitor.teamId, teamContext.teamId), eq(monitor.id, monitorIdNum)),
      )
      .limit(1);

    if (!mon) {
      throw new HTTPException(404, { message: "Monitor not found" });
    }

    const findings = await db
      .select()
      .from(analystFinding)
      .where(eq(analystFinding.monitorId, monitorIdNum))
      .orderBy(desc(analystFinding.createdAt))
      .limit(limit);

    return c.json(
      findings.map((finding) => ({
        id: finding.id,
        createdAt: finding.createdAt.getTime(),
        severity: finding.severity,
        anomalies: parseJsonArray(finding.anomalies),
        prediction: parseJsonRecord(finding.prediction),
        summary: finding.summary,
        notified: finding.notified,
      })),
      200,
    );
  });
}
