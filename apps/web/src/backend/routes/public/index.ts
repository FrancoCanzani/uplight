import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../types";
import { registerHealth } from "./health";
import { registerHeartbeat } from "./heartbeat";
import { registerSitemap } from "./sitemap";
import { registerGetStats } from "./stats";
import { registerGetPublicStatusPage } from "./status-pages/get";
import { registerGetLogo } from "./status-pages/logo";

const publicRouter = new OpenAPIHono<AppEnv>();

registerHealth(publicRouter);
registerHeartbeat(publicRouter);
registerSitemap(publicRouter);
registerGetPublicStatusPage(publicRouter);
registerGetLogo(publicRouter);
registerGetStats(publicRouter);

export { publicRouter };
