import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { user } from "../../../../db/auth-schema";
import { teamMember } from "../../../../db/schema";
import type { AppEnv } from "../../../../types";
import { TeamMemberResponseSchema } from "../schemas";

const route = createRoute({
  method: "get",
  path: "/:teamId/members",
  tags: ["teams"],
  summary: "Get team members",
  description: "Gets all members of a team",
  request: {
    params: z.object({
      teamId: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(TeamMemberResponseSchema),
        },
      },
      description: "List of team members",
    },
  },
});

export function registerGetAllTeamMembers(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = createDb(c.env.DB);

    // Query team members with user details
    const members = await db
      .select({
        userId: teamMember.userId,
        role: teamMember.role,
        createdAt: teamMember.createdAt,
        name: user.name,
        email: user.email,
      })
      .from(teamMember)
      .innerJoin(user, eq(teamMember.userId, user.id))
      .where(eq(teamMember.teamId, teamContext.teamId))
      .orderBy(
        // Order by role: owner (1), admin (2), member (3)
        sql`CASE ${teamMember.role}
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'member' THEN 3
        END`,
        teamMember.createdAt,
      );

    const result = members.map((member) => ({
      userId: member.userId,
      name: member.name,
      email: member.email,
      role: member.role,
      createdAt: member.createdAt.toISOString(),
    }));

    return c.json(result, 200);
  });
}
