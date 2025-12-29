import { OpenAPIHono } from "@hono/zod-openapi";
import { monitors } from "./monitors";
import { teams } from "./teams";
import { maintenance } from "./maintenance";
import { incidents } from "./incidents";
import { logs } from "./logs";
import { heartbeats } from "./heartbeats";
import type { AppEnv } from "../../types";

const protectedRouter = new OpenAPIHono<AppEnv>();

protectedRouter.route("/teams", teams);
protectedRouter.route("/monitors", monitors);
protectedRouter.route("/heartbeats", heartbeats);
protectedRouter.route("/maintenance", maintenance);
protectedRouter.route("/incidents", incidents);
protectedRouter.route("/logs", logs);

export { protectedRouter };
