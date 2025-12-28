import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { team, teamMember } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { TeamResponseSchema } from "./schemas";

const route = createRoute({
  method: "get",
  path: "/",
  tags: ["teams"],
  summary: "Get all teams for the current user",
  description: "Returns all teams the current user is a member of",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(TeamResponseSchema),
        },
      },
      description: "List of teams",
    },
  },
});

export function registerGetAllTeams(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    const memberships = await db
      .select({
        team: team,
        role: teamMember.role,
      })
      .from(teamMember)
      .innerJoin(team, eq(teamMember.teamId, team.id))
      .where(eq(teamMember.userId, user.id));

    const teams = memberships.map((m) => ({
      id: m.team.id,
      name: m.team.name,
      personal: m.team.personal,
      role: m.role,
      createdAt: m.team.createdAt.toISOString(),
      updatedAt: m.team.updatedAt.toISOString(),
    }));

    return c.json(teams, 200);
  });
}
