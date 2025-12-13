import { OpenAPIHono } from "@hono/zod-openapi";
import { health } from "./health";
import { heartbeat } from "./heartbeat";
import type { AppEnv } from "../../types";

const publicRouter = new OpenAPIHono<AppEnv>();

publicRouter.route("/health", health);
publicRouter.route("/heartbeat", heartbeat);

export { publicRouter };
