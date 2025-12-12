import { Hono } from "hono";
import { health } from "./health";
import { heartbeat } from "./heartbeat";

const publicRouter = new Hono<{ Bindings: Env }>();

publicRouter.route("/health", health);
publicRouter.route("/heartbeat", heartbeat);

export { publicRouter };

