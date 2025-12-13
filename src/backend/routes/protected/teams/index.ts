import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../../types";
import { get } from "./get";
import { getAll } from "./get-all";
import { post } from "./post";

const teamsRouter = new OpenAPIHono<AppEnv>();

teamsRouter.route("/", post);
teamsRouter.route("/", getAll);
teamsRouter.route("/", get);

export { teamsRouter };
