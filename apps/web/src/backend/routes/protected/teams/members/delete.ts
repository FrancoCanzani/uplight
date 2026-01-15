import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { eq, and, sql } from "drizzle-orm";
import { createDb } from "../../../../db";
import { teamMember } from "../../../../db/schema";
import type { AppEnv } from "../../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId/members/:userId",
  tags: ["teams"],
  summary: "Remove team member",
  description: "Removes a member from the team (owner/admin only)",
  request: {
    params: z.object({
      teamId: z.string().openapi({ example: "1" }),
      userId: z.string().openapi({ example: "user123" }),
    }),
  },
  responses: {
    204: {
      description: "Member removed successfully",
    },
  },
});

export function registerDeleteTeamMember(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    // Check if user has permission (owner or admin)
    if (teamContext.role !== "owner" && teamContext.role !== "admin") {
      throw new HTTPException(403, {
        message: "Only owners and admins can remove members",
      });
    }

    const db = createDb(c.env.DB);
    const { userId } = c.req.param();

    // Get the target member's role
    const [targetMember] = await db
      .select({ role: teamMember.role })
      .from(teamMember)
      .where(
        and(
          eq(teamMember.teamId, teamContext.teamId),
          eq(teamMember.userId, userId)
        )
      )
      .limit(1);

    if (!targetMember) {
      throw new HTTPException(404, { message: "Team member not found" });
    }

    // Only owners can remove owners
    if (targetMember.role === "owner" && teamContext.role !== "owner") {
      throw new HTTPException(403, {
        message: "Only owners can remove owners",
      });
    }

    // If removing an owner, check if they're the last owner
    if (targetMember.role === "owner") {
      const [ownerCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(teamMember)
        .where(
          and(
            eq(teamMember.teamId, teamContext.teamId),
            eq(teamMember.role, "owner")
          )
        );

      if (ownerCount.count <= 1) {
        throw new HTTPException(400, { message: "Cannot remove last owner" });
      }
    }

    // Remove the member
    await db
      .delete(teamMember)
      .where(
        and(
          eq(teamMember.teamId, teamContext.teamId),
          eq(teamMember.userId, userId)
        )
      );

    return c.body(null, 204);
  });
}
