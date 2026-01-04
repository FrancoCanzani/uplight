import { OpenAPIHono } from "@hono/zod-openapi";
import { requireTeamMember } from "../../../middleware/team";
import type { AppEnv } from "../../../types";
import { registerGetAllIncidents } from "./get-all";
import { registerGetIncident } from "./get";
import { registerPatchIncident } from "./patch";
import { registerPutIncident } from "./put";

const incidents = new OpenAPIHono<AppEnv>();

incidents.use("/:teamId", requireTeamMember());
incidents.use("/:teamId/:incidentId", requireTeamMember());

registerGetAllIncidents(incidents);
registerGetIncident(incidents);
registerPatchIncident(incidents);
registerPutIncident(incidents);

export { incidents };
