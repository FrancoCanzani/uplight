import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import { createDb } from "../../../db";
import { team } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { UpdateTeamSchema, TeamResponseSchema } from "./schemas";

const route = createRoute({
  method: "put",
  path: "/:teamId",
  tags: ["teams"],
  summary: "Update a team",
  description: "Updates team name (owner/admin only)",
  request: {
    params: z.object({
      teamId: z.string().openapi({ example: "1" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateTeamSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TeamResponseSchema,
        },
      },
      description: "Team updated successfully",
    },
  },
});

export function registerPutTeam(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    if (teamContext.role !== "owner" && teamContext.role !== "admin") {
      throw new HTTPException(403, { message: "Insufficient permissions" });
    }

    const data = c.req.valid("json");
    if (!data.name) {
      throw new HTTPException(400, { message: "Name is required" });
    }

    const db = createDb(c.env.DB);

    const [updatedTeam] = await db
      .update(team)
      .set({
        name: data.name,
        updatedAt: new Date(),
      })
      .where(eq(team.id, teamContext.teamId))
      .returning();

    return c.json(
      {
        id: updatedTeam.id,
        name: updatedTeam.name,
        personal: updatedTeam.personal,
        role: teamContext.role,
        createdAt: updatedTeam.createdAt.toISOString(),
        updatedAt: updatedTeam.updatedAt.toISOString(),
      },
      200
    );
  });
}

