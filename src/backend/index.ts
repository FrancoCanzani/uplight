import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { createAuth } from "../../auth";

const app = new Hono<{ Bindings: Env }>();

app.use(logger());
app.use(csrf());
app.use(prettyJSON());
app.use(secureHeaders());

app.all("/api/auth/*", async (c) => {
  if (!c.env.DB) {
    return c.json({ error: "Database not available" }, 500);
  }
  const authInstance = createAuth(c.env);
  return authInstance.handler(c.req.raw);
});

app.get("/api/", async (c) => {
  return c.json({
    name: "Cloudflare Workers",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default app;
