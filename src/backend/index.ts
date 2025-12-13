import { OpenAPIHono } from "@hono/zod-openapi";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { createAuth } from "../../auth";
import { authMiddleware, requireAuth } from "./middleware/auth";
import { publicRouter } from "./routes/public";
import { protectedRouter } from "./routes/protected";
import type { AppEnv } from "./types";

const app = new OpenAPIHono<AppEnv>();

app.use(logger());
app.use(csrf());
app.use(prettyJSON());
app.use(secureHeaders());

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }
  console.error(error);
  return c.json({ error: "Internal Server Error" }, 500);
});

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

app.doc("/api/openapi", {
  openapi: "3.0.0",
  info: {
    title: "Uplight API",
    version: "1.0.0",
    description: "Uptime monitoring API",
  },
});

export default app;
