import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import { createDb } from "../../../db";
import { team } from "../../../db/schema";
import type { AppEnv } from "../../../types";

const route = createRoute({
  method: "delete",
  path: "/:teamId",
  tags: ["teams"],
  summary: "Delete a team",
  description: "Deletes a team (owner only, cannot delete personal team)",
  request: {
    params: z.object({
      teamId: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    204: {
      description: "Team deleted successfully",
    },
  },
});

export function registerDeleteTeam(api: OpenAPIHono<AppEnv>) {
  return api.openapi(route, async (c) => {
    const teamContext = c.get("team");
    if (!teamContext) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    if (teamContext.role !== "owner") {
      throw new HTTPException(403, { message: "Only owners can delete teams" });
    }

    const db = createDb(c.env.DB);

    const [teamData] = await db
      .select()
      .from(team)
      .where(eq(team.id, teamContext.teamId))
      .limit(1);

    if (!teamData) {
      throw new HTTPException(404, { message: "Team not found" });
    }

    if (teamData.personal) {
      throw new HTTPException(400, { message: "Cannot delete personal team" });
    }

    await db.delete(team).where(eq(team.id, teamContext.teamId));

    return c.body(null, 204);
  });
}

