import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as authSchema from "./src/backend/db/auth-schema";
import { team, teamMember } from "./src/backend/db/schema";

function createAuth(env?: Env) {
  const db = env?.DB ? drizzle(env.DB) : null;

  return betterAuth({
    database: env?.DB
      ? drizzleAdapter(drizzle(env.DB, { schema: authSchema }), {
          provider: "sqlite",
          schema: authSchema,
        })
      : drizzleAdapter({} as D1Database, {
          provider: "sqlite",
          schema: authSchema,
        }),
    emailAndPassword: {
      enabled: true,
    },
    secret: env?.BETTER_AUTH_SECRET,
    baseURL: env?.BETTER_AUTH_URL,
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            if (!db) return;

            const [personalTeam] = await db
              .insert(team)
              .values({
                name: "Personal",
                personal: true,
              })
              .returning();

            await db.insert(teamMember).values({
              teamId: personalTeam.id,
              userId: user.id,
              role: "owner",
            });
          },
        },
      },
    },
  });
}

export const auth = createAuth();

export { createAuth };
