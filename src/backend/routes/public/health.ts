import { Hono } from "hono";

const health = new Hono<{ Bindings: Env }>();

health.get("/", async (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export { health };

