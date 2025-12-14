import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerGetMonitor } from "./get";
import { registerGetAllMonitors } from "./get-all";
import { registerPostMonitor } from "./post";

const monitors = new OpenAPIHono<AppEnv>();

monitors.use("/:teamId", requireTeamMember());
monitors.use("/:teamId/*", requireTeamMember());

registerGetMonitor(monitors);
registerGetAllMonitors(monitors);
registerPostMonitor(monitors);

export { monitors };
