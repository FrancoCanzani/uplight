import { OpenAPIHono } from "@hono/zod-openapi";
import { waitUntil } from "cloudflare:workers";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { createAuth } from "../../auth";
import { runAnomalyPass } from "./analyst/jobs/run-anomaly-pass";
import { runBaselineJob } from "./analyst/jobs/run-baseline-job";
import { runPredictionPass } from "./analyst/jobs/run-prediction-pass";
import { runProviderPoller } from "./analyst/jobs/run-provider-poller";
import { runRollupJob } from "./analyst/jobs/run-rollup-job";
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
import { registerRobots, registerSitemap } from "./routes/seo";
import type { AppEnv } from "./types";

export { CheckerDO } from "./checkers/executors/durable-object";

const app = new OpenAPIHono<AppEnv>();

app.use(logger());
app.use(csrf());
app.use(prettyJSON());
app.use(secureHeaders());

// SEO routes (before auth middleware)
registerSitemap(app);
registerRobots(app);

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }
  console.error(error);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.use("*", authMiddleware);

app.use("/api/auth/*", async (c, next) => {
  if (c.req.path === "/api/auth/get-session") return next();
  return authRateLimiter(c, next);
});
app.all("/api/auth/*", async (c) => {
  if (!c.env.DB) {
    return c.json({ error: "Database not available" }, 500);
  }
  const authInstance = createAuth(c.env);
  return authInstance.handler(c.req.raw);
});

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
    {
      name: "integrations",
      description: "Alert integrations (Slack, Discord, webhooks)",
    },
  ],
});

export default {
  fetch: app.fetch,
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
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
          waitUntil(runProviderPoller(env));
          console.log(
            "Monitors, heartbeats, and provider status check processed",
          );
          break;
        case "*/5 * * * *":
          waitUntil(runAnomalyPass(env));
          console.log("Analyst anomaly pass processed");
          break;
        case "0 */6 * * *":
          waitUntil(runBaselineJob(env));
          console.log("Analyst baseline job processed");
          break;
        case "5 * * * *":
          waitUntil(runRollupJob(env));
          console.log("Analyst hourly rollup processed");
          break;
        case "30 * * * *":
          waitUntil(runPredictionPass(env));
          console.log("Analyst prediction pass processed");
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
    if (batch.queue === "uplight-integrations") {
      await handleIntegrationQueue(batch as MessageBatch<QueueMessage>, env);
    }
  },
};
