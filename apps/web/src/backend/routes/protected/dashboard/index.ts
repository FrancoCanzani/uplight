import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerGetDashboardHome } from "./get-home";

const dashboard = new OpenAPIHono<AppEnv>();

dashboard.use(":teamId/*", requireTeamMember());

registerGetDashboardHome(dashboard);

export { dashboard };
