import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { createAuth } from "../../auth";
import { authMiddleware, requireAuth } from "./middleware/auth";
import { publicRouter } from "./routes/public";
import { protectedRouter } from "./routes/protected";

const app = new Hono<{ Bindings: Env }>();

app.use(logger());
app.use(csrf());
app.use(prettyJSON());
app.use(secureHeaders());

app.use("*", authMiddleware);

app.all("/api/auth/*", async (c) => {
  if (!c.env.DB) {
    return c.json({ error: "Database not available" }, 500);
  }
  const authInstance = createAuth(c.env);
  return authInstance.handler(c.req.raw);
});

app.route("/api/public", publicRouter);

app.use("/api/*", requireAuth);
app.route("/api", protectedRouter);

export default app;
