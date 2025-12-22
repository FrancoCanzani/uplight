import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerGetMonitor } from "./get";
import { registerGetAllMonitors } from "./get-all";
import { registerPostMonitor } from "./post";
import { registerPutMonitor } from "./put";
import { registerGetStats } from "./get-stats";
import { registerGetChecks } from "./get-checks";
import { registerGetIncidents } from "./get-incidents";
import { registerPatchMonitorStatus } from "./patch";

const monitors = new OpenAPIHono<AppEnv>();

monitors.use("/:teamId", requireTeamMember());
monitors.use("/:teamId/*", requireTeamMember());

registerGetMonitor(monitors);
registerGetAllMonitors(monitors);
registerPostMonitor(monitors);
registerPutMonitor(monitors);
registerGetStats(monitors);
registerGetChecks(monitors);
registerGetIncidents(monitors);
registerPatchMonitorStatus(monitors);

export { monitors };
