import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { incidentActivities } from "./activities";
import { registerGetIncident } from "./get";
import { registerGetAllIncidents } from "./get-all";
import { registerPatchIncident } from "./patch";
import { registerPutIncident } from "./put";

const incidents = new OpenAPIHono<AppEnv>();

incidents.use("/:teamId", requireTeamMember());
incidents.use("/:teamId/:incidentId", requireTeamMember());

registerGetAllIncidents(incidents);
registerGetIncident(incidents);
registerPatchIncident(incidents);
registerPutIncident(incidents);

incidents.route("/", incidentActivities);

export { incidents };
