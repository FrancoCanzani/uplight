import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerDeleteMonitor } from "./delete";
import { registerGetMonitor } from "./get";
import { registerGetAllMonitors } from "./get-all";
import { registerGetCheckDetail } from "./get-check-detail";
import { registerGetChecks } from "./get-checks";
import { registerGetIncidents } from "./get-incidents";
import { registerGetStats } from "./get-stats";
import { registerPatchMonitorStatus } from "./patch";
import { registerPostMonitor } from "./post";
import { registerPutMonitor } from "./put";

const monitors = new OpenAPIHono<AppEnv>();

monitors.use("/:teamId", requireTeamMember());
monitors.use("/:teamId/*", requireTeamMember());

registerGetMonitor(monitors);
registerGetAllMonitors(monitors);
registerPostMonitor(monitors);
registerPutMonitor(monitors);
registerDeleteMonitor(monitors);
registerGetStats(monitors);
registerGetChecks(monitors);
registerGetCheckDetail(monitors);
registerGetIncidents(monitors);
registerPatchMonitorStatus(monitors);

export { monitors };
