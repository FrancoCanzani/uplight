import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../types";
import { heartbeats } from "./heartbeats";
import { incidents } from "./incidents";
import { integrations } from "./integrations";
import { maintenance } from "./maintenance";
import { monitors } from "./monitors";
import { statusPages } from "./status-pages";
import { teams } from "./teams";

const protectedRouter = new OpenAPIHono<AppEnv>();

protectedRouter.route("/teams", teams);
protectedRouter.route("/monitors", monitors);
protectedRouter.route("/heartbeats", heartbeats);
protectedRouter.route("/maintenance", maintenance);
protectedRouter.route("/incidents", incidents);
protectedRouter.route("/integrations", integrations);
protectedRouter.route("/status-pages", statusPages);

export { protectedRouter };
