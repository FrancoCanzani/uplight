import { Context, Next } from "hono";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { team, teamMember } from "../db/schema";
import type { TeamRole, AppEnv } from "../types";

export function requireTeamMember(allowedRoles?: TeamRole[]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const teamIdParam = c.req.param("teamId");
    if (!teamIdParam) {
      throw new HTTPException(400, { message: "Team ID required" });
    }

    const teamId = Number(teamIdParam);
    if (isNaN(teamId)) {
      throw new HTTPException(400, { message: "Invalid team ID" });
    }

    const db = createDb(c.env.DB);

    const membership = await db
      .select({
        teamId: teamMember.teamId,
        role: teamMember.role,
      })
      .from(teamMember)
      .innerJoin(team, eq(teamMember.teamId, team.id))
      .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, user.id)))
      .limit(1);

    if (membership.length === 0) {
      throw new HTTPException(403, { message: "Not a member of this team" });
    }

    const role = membership[0].role as TeamRole;

    if (allowedRoles && !allowedRoles.includes(role)) {
      throw new HTTPException(403, { message: "Insufficient permissions" });
    }

    c.set("team", { teamId, role });

    await next();
  };
}
