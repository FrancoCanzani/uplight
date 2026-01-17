import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../types";
import { registerHealth } from "./health";
import { registerHeartbeat } from "./heartbeat";

const publicRouter = new OpenAPIHono<AppEnv>();

registerHealth(publicRouter);
registerHeartbeat(publicRouter);

export { publicRouter };
