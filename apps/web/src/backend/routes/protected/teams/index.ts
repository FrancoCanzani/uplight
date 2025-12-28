import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../../types";
import { requireTeamMember } from "../../../middleware/team";
import { registerGetTeam } from "./get";
import { registerGetAllTeams } from "./get-all";
import { registerPostTeam } from "./post";
import { registerPutTeam } from "./put";
import { registerDeleteTeam } from "./delete";

const teams = new OpenAPIHono<AppEnv>();

registerPostTeam(teams);
registerGetAllTeams(teams);
registerGetTeam(teams);

teams.use("/:teamId", requireTeamMember());
teams.use("/:teamId/*", requireTeamMember());

registerPutTeam(teams);
registerDeleteTeam(teams);

export { teams };
