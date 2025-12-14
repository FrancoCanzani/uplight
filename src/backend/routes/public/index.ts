import { OpenAPIHono } from "@hono/zod-openapi";
import { registerHealth } from "./health";
import { registerHeartbeat } from "./heartbeat";
import type { AppEnv } from "../../types";

const publicRouter = new OpenAPIHono<AppEnv>();

registerHealth(publicRouter);
registerHeartbeat(publicRouter);

export { publicRouter };
