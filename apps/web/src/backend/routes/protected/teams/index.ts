import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../../types";
import { registerGetTeam } from "./get";
import { registerGetAllTeams } from "./get-all";
import { registerPostTeam } from "./post";

const teams = new OpenAPIHono<AppEnv>();

registerPostTeam(teams);
registerGetAllTeams(teams);
registerGetTeam(teams);

export { teams };
