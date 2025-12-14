import { OpenAPIHono } from "@hono/zod-openapi";
import { monitors } from "./monitors";
import { teams } from "./teams";
import type { AppEnv } from "../../types";

const protectedRouter = new OpenAPIHono<AppEnv>();

protectedRouter.route("/teams", teams);
protectedRouter.route("/monitors", monitors);

export { protectedRouter };
