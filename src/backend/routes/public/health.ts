import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../types";

const health = new OpenAPIHono<AppEnv>();

health.get("/", async (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export { health };
