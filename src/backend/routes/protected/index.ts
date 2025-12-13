import { OpenAPIHono } from "@hono/zod-openapi";
import { monitors } from "./monitors";
import { teamsRouter } from "./teams";
import { requireTeamMember } from "../../middleware/team";
import type { AppEnv } from "../../types";

const protectedRouter = new OpenAPIHono<AppEnv>();

protectedRouter.route("/teams", teamsRouter);
protectedRouter.use("/teams/:teamId/monitors/*", requireTeamMember());
protectedRouter.route("/teams/:teamId/monitors", monitors);

export { protectedRouter };
