import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as authSchema from "./src/backend/db/auth-schema";

function createAuth(env?: Env) {
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
    });
}

export const auth = createAuth();

export { createAuth };
