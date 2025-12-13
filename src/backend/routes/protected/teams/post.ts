import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { team, teamMember } from "../../../db/schema";
import type { AppEnv } from "../../../types";
import { CreateTeamSchema, TeamResponseSchema } from "./schemas";

const createTeamRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["teams"],
  summary: "Create a new team",
  description: "Creates a new team and adds the current user as owner",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateTeamSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: TeamResponseSchema,
        },
      },
      description: "Team created successfully",
    },
  },
});

const post = new OpenAPIHono<AppEnv>();

post.openapi(createTeamRoute, async (c) => {
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const data = c.req.valid("json");
  const db = drizzle(c.env.DB);

  const [createdTeam] = await db
    .insert(team)
    .values({
      name: data.name,
      personal: false,
    })
    .returning();

  await db.insert(teamMember).values({
    teamId: createdTeam.id,
    userId: user.id,
    role: "owner",
  });

  return c.json(
    {
      id: createdTeam.id,
      name: createdTeam.name,
      personal: createdTeam.personal,
      role: "owner" as const,
      createdAt: createdTeam.createdAt.getTime(),
      updatedAt: createdTeam.updatedAt.getTime(),
    },
    201
  );
});

export { post };
