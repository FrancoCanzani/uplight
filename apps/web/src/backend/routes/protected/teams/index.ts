import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../../types";
import { requireTeamMember } from "../../../middleware/team";
import { registerGetTeam } from "./get";
import { registerGetAllTeams } from "./get-all";
import { registerPostTeam } from "./post";
import { registerPutTeam } from "./put";
import { registerDeleteTeam } from "./delete";
import { registerGetAllTeamMembers } from "./members/get-all";
import { registerPostTeamMember } from "./members/post";
import { registerPutTeamMember } from "./members/put";
import { registerDeleteTeamMember } from "./members/delete";

const teams = new OpenAPIHono<AppEnv>();

registerPostTeam(teams);
registerGetAllTeams(teams);
registerGetTeam(teams);

teams.use("/:teamId", requireTeamMember());
teams.use("/:teamId/*", requireTeamMember());

registerPutTeam(teams);
registerDeleteTeam(teams);
registerGetAllTeamMembers(teams);
registerPostTeamMember(teams);
registerPutTeamMember(teams);
registerDeleteTeamMember(teams);

export { teams };
