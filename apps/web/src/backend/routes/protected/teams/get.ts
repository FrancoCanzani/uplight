import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../db";
import { team, teamMember } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { TeamResponseSchema } from "./schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId",
  tags: ["teams"],
  summary: "Get a team by ID",
  description: "Returns a team if the current user is a member",
  request: {
    params: z.object({
      teamId: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TeamResponseSchema,
        },
      },
      description: "Team details",
    },
  },
});

export function registerGetTeam(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const { teamId } = c.req.valid("param");
    const db = createDb(c.env.DB);

    const membership = await db
      .select({
        team: team,
        role: teamMember.role,
      })
      .from(teamMember)
      .innerJoin(team, eq(teamMember.teamId, team.id))
      .where(
        and(
          eq(teamMember.teamId, Number(teamId)),
          eq(teamMember.userId, user.id)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      throw new HTTPException(404, { message: "Team not found" });
    }

    const m = membership[0];

    return c.json(
      {
        id: m.team.id,
        name: m.team.name,
        personal: m.team.personal,
        role: m.role,
        createdAt: m.team.createdAt,
        updatedAt: m.team.updatedAt,
      },
      200
    );
  });
}
