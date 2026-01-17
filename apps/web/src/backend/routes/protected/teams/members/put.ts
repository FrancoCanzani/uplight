import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../../../db";
import { user } from "../../../../db/auth-schema";
import { teamMember } from "../../../../db/schema";
import type { AppEnv } from "../../../../types";
import { TeamMemberResponseSchema, UpdateMemberRoleSchema } from "../schemas";

const route = createRoute({
  method: "put",
  path: "/:teamId/members/:userId",
  tags: ["teams"],
  summary: "Update member role",
  description: "Updates a team member's role (owner/admin only)",
  request: {
    params: z.object({
      teamId: z.string().openapi({ example: "1" }),
      userId: z.string().openapi({ example: "user123" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateMemberRoleSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TeamMemberResponseSchema,
        },
      },
      description: "Member role updated successfully",
    },
  },
});

export function registerPutTeamMember(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    // Check if user has permission (owner or admin)
    if (teamContext.role !== "owner" && teamContext.role !== "admin") {
      throw new HTTPException(403, {
        message: "Only owners and admins can change member roles",
      });
    }

    const db = createDb(c.env.DB);
    const { userId } = c.req.param();
    const { role: newRole } = c.req.valid("json");

    // Get the target member's current role
    const [targetMember] = await db
      .select({ role: teamMember.role })
      .from(teamMember)
      .where(
        and(
          eq(teamMember.teamId, teamContext.teamId),
          eq(teamMember.userId, userId),
        ),
      )
      .limit(1);

    if (!targetMember) {
      throw new HTTPException(404, { message: "Team member not found" });
    }

    const currentRole = targetMember.role;

    // Only owners can change owner roles (promote to owner or demote owner)
    if (
      (currentRole === "owner" || newRole === "owner") &&
      teamContext.role !== "owner"
    ) {
      throw new HTTPException(403, {
        message: "Only owners can change owner roles",
      });
    }

    // If demoting an owner, check if they're the last owner
    if (currentRole === "owner" && newRole !== "owner") {
      const [ownerCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(teamMember)
        .where(
          and(
            eq(teamMember.teamId, teamContext.teamId),
            eq(teamMember.role, "owner"),
          ),
        );

      if (ownerCount.count <= 1) {
        throw new HTTPException(400, {
          message: "Cannot change role of last owner",
        });
      }
    }

    // Update the member's role
    await db
      .update(teamMember)
      .set({ role: newRole })
      .where(
        and(
          eq(teamMember.teamId, teamContext.teamId),
          eq(teamMember.userId, userId),
        ),
      );

    // Get updated member with user details
    const [updatedMember] = await db
      .select({
        userId: teamMember.userId,
        role: teamMember.role,
        createdAt: teamMember.createdAt,
        name: user.name,
        email: user.email,
      })
      .from(teamMember)
      .innerJoin(user, eq(teamMember.userId, user.id))
      .where(
        and(
          eq(teamMember.teamId, teamContext.teamId),
          eq(teamMember.userId, userId),
        ),
      )
      .limit(1);

    return c.json(
      {
        userId: updatedMember.userId,
        name: updatedMember.name,
        email: updatedMember.email,
        role: updatedMember.role,
        createdAt: updatedMember.createdAt.toISOString(),
      },
      200,
    );
  });
}
