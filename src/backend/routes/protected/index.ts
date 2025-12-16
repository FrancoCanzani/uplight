import { OpenAPIHono } from "@hono/zod-openapi";
import { monitors } from "./monitors";
import { teams } from "./teams";
import { maintenance } from "./maintenance";
import { incidents } from "./incidents";
import type { AppEnv } from "../../types";

const protectedRouter = new OpenAPIHono<AppEnv>();

protectedRouter.route("/teams", teams);
protectedRouter.route("/monitors", monitors);
protectedRouter.route("/maintenance", maintenance);
protectedRouter.route("/incidents", incidents);

export { protectedRouter };
