import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const LOCAL_DB_PATH = process.env.LOCAL_DB_PATH;

export default defineConfig({
  out: "./drizzle",
  schema: "./src/backend/db/schema.ts",
  dialect: "sqlite",
  ...(LOCAL_DB_PATH
    ? {
        dbCredentials: {
          url: LOCAL_DB_PATH,
        },
      }
    : {
        driver: "d1-http",
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
          databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
          token: process.env.CLOUDFLARE_D1_TOKEN!,
        },
      }),
});
