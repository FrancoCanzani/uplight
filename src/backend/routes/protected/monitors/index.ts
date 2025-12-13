import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../../types";
import { post } from "./post";

const monitors = new OpenAPIHono<AppEnv>();

monitors.route("/", post);

export { monitors };
