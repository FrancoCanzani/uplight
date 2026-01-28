import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { user } from "../../../../db/auth-schema";
import { team, teamMember } from "../../../../db/schema";
import type { AppEnv } from "../../../../types";
import { InviteMemberSchema, TeamMemberResponseSchema } from "../schemas";

const route = createRoute({
  method: "post",
  path: "/:teamId/members",
  tags: ["teams"],
  summary: "Add team member",
  description: "Adds a member to the team by email (owner/admin only)",
  request: {
    params: z.object({
      teamId: z.string().openapi({ example: "1" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: InviteMemberSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: TeamMemberResponseSchema,
        },
      },
      description: "Member added successfully",
    },
  },
});

export function registerPostTeamMember(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    // Check if user has permission (owner or admin)
    if (teamContext.role !== "owner" && teamContext.role !== "admin") {
      throw new HTTPException(403, {
        message: "Only owners and admins can add members",
      });
    }

    const db = createDb(c.env.DB);
    const { email, role } = c.req.valid("json");

    // Check if team is personal
    const [teamData] = await db
      .select({ personal: team.personal })
      .from(team)
      .where(eq(team.id, teamContext.teamId))
      .limit(1);

    if (!teamData) {
      throw new HTTPException(404, { message: "Team not found" });
    }

    if (teamData.personal) {
      throw new HTTPException(400, {
        message: "Cannot add members to personal teams",
      });
    }

    // Look up user by email
    const [targetUser] = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!targetUser) {
      // Use generic message to prevent user enumeration
      throw new HTTPException(400, {
        message: "Unable to add member. Please verify the email address.",
      });
    }

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(teamMember)
      .where(
        and(
          eq(teamMember.teamId, teamContext.teamId),
          eq(teamMember.userId, targetUser.id),
        ),
      )
      .limit(1);

    if (existingMember) {
      // Use generic message to prevent user enumeration
      throw new HTTPException(400, {
        message: "Unable to add member. Please verify the email address.",
      });
    }

    // Add member to team
    const [newMember] = await db
      .insert(teamMember)
      .values({
        teamId: teamContext.teamId,
        userId: targetUser.id,
        role: role,
      })
      .returning();

    return c.json(
      {
        userId: newMember.userId,
        name: targetUser.name,
        email: targetUser.email,
        role: newMember.role,
        createdAt: newMember.createdAt.toISOString(),
      },
      201,
    );
  });
}
