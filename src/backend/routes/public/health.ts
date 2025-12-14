import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../types";

export function registerHealth(api: OpenAPIHono<AppEnv>) {
  return api.get("/health", async (c) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });
}
