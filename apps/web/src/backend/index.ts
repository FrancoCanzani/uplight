import { OpenAPIHono } from "@hono/zod-openapi";
import { waitUntil } from "cloudflare:workers";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { createAuth } from "../../auth";
import { handleDomainChecks } from "./checkers/cron/domains";
import { handleHeartbeatChecks } from "./checkers/cron/heartbeats";
import { handleMonitorChecks } from "./checkers/cron/monitors";
import { handleDataRetention } from "./checkers/cron/retention";
import { handleIntegrationQueue } from "./integrations/queue-handler";
import type { QueueMessage } from "./integrations/types";
import { authMiddleware, requireAuth } from "./middleware/auth";
import { authRateLimiter, publicApiRateLimiter } from "./middleware/rate-limit";
import { protectedRouter } from "./routes/protected";
import { publicRouter } from "./routes/public";
import type { AppEnv } from "./types";

export { CheckerDO } from "./checkers/executors/durable-object";

const app = new OpenAPIHono<AppEnv>();

app.use(logger());
app.use(csrf());
app.use(prettyJSON());
app.use(secureHeaders());

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }
  console.error(error);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.use("*", authMiddleware);

// Rate limit auth endpoints
app.use("/api/auth/*", authRateLimiter);
app.all("/api/auth/*", async (c) => {
  if (!c.env.DB) {
    return c.json({ error: "Database not available" }, 500);
  }
  const authInstance = createAuth(c.env);
  return authInstance.handler(c.req.raw);
});

// Rate limit public API
app.use("/api/public/*", publicApiRateLimiter);
app.route("/api/public", publicRouter);

app.use("/api/*", requireAuth);
app.route("/api", protectedRouter);

app.doc("/api/openapi", {
  openapi: "3.0.0",
  info: {
    title: "Uplight API",
    version: "1.0.0",
    description:
      "Uplight is an open-source uptime monitoring API. Monitor HTTP endpoints, TCP services, and heartbeats with alerts via Slack, Discord, webhooks, and more.",
    contact: {
      name: "Uplight",
      url: "https://github.com/your-org/uplight",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "/api",
      description: "API server",
    },
  ],
  tags: [
    { name: "monitors", description: "HTTP and TCP monitor management" },
    { name: "heartbeats", description: "Heartbeat monitor management" },
    { name: "incidents", description: "Incident management" },
    { name: "maintenance", description: "Maintenance window management" },
    { name: "status-pages", description: "Public status page management" },
    { name: "teams", description: "Team and member management" },
    { name: "integrations", description: "Alert integrations (Slack, Discord, webhooks)" },
  ],
});

// Swagger UI endpoint
app.get("/api/docs", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Uplight API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script>
        SwaggerUIBundle({
          url: '/api/openapi',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
        });
      </script>
    </body>
    </html>
  `);
});

export default {
  fetch: app.fetch,
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext, // eslint-disable-line
  ) {
    if (!controller.cron) {
      // Fallback: run all checks if cron is null/undefined
      waitUntil(handleMonitorChecks(env));
      waitUntil(handleHeartbeatChecks(env));
      waitUntil(handleDomainChecks(env));
      console.log("All checks processed (fallback - cron is null/undefined)");
    } else {
      switch (controller.cron) {
        case "* * * * *":
          waitUntil(handleMonitorChecks(env));
          waitUntil(handleHeartbeatChecks(env));
          console.log("Monitors and heartbeats check processed");
          break;
        case "0 0,12 * * *":
          waitUntil(handleDomainChecks(env));
          console.log("Domain check processed");
          break;
        case "0 3 * * *":
          waitUntil(handleDataRetention(env));
          console.log("Data retention processed");
          break;
        default:
          // Fallback: run all checks if cron is unrecognized
          waitUntil(handleMonitorChecks(env));
          waitUntil(handleHeartbeatChecks(env));
          waitUntil(handleDomainChecks(env));
          console.log("All checks processed (fallback - unrecognized cron)");
          break;
      }
    }
    console.log("cron processed");
  },
  async queue(batch: MessageBatch<QueueMessage>, env: Env) {
    await handleIntegrationQueue(batch, env);
  },
};
